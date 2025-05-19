import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../context/ToastContext';
import { webSocketService } from '../../services/websocket';
import LeftSidebar from '../../components/LeftSidebar';
import RightSidebar from '../../components/RightSidebar';
import SharePostModal from '../../components/Post/SharePostModal';
import PostOptionsMenu from '../../components/Post/PostOptionsMenu';
import ImageViewerModal from '../../components/Post/ImageViewerModal';
import { Modal, Button } from 'react-bootstrap';
import CommentSuggestions from '../../components/CommentSuggestions';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useUser();
  const { showSuccess, showError } = useToast();

  // Get query parameters for comment highlighting
  const queryParams = new URLSearchParams(location.search);
  const highlightCommentId = queryParams.get('commentId');

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  // Không cần các state này nữa vì đã được xử lý trong component Comment
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLoading, setIsLoading] = useState({});
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);

  // Ref for highlighted comment
  const highlightedCommentRef = useRef(null);

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!postId) {
          setError('Post ID is missing');
          setLoading(false);
          return;
        }

        if (!currentUser?.id) {
          console.log('Current user not loaded yet');
          return; // Don't fetch post if user is not loaded yet
        }

        const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/posts/${postId}?viewerId=${currentUser.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPost(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching post:', error);
        if (error.message.includes('403')) {
          setError('403 Forbidden: You do not have permission to view this post.');
        } else if (error.message.includes('404')) {
          setError('404 Not Found: The post you are looking for does not exist.');
        } else {
          setError('Failed to load post. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, currentUser?.id]); // Add currentUser.id as dependency

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!currentUser?.id) {
          console.log('No user ID found');
          return;
        }

        const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/profile/${currentUser.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Nếu token hết hạn, chuyển về trang login
        if (error.message.includes('401')) {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    };

    fetchUserProfile();
  }, [currentUser?.id]);

  // Biến để theo dõi xem người dùng có đang nhập liệu không
  const isUserTyping = useRef(false);

  // Biến để theo dõi xem có đang hiển thị ô nhập phản hồi không
  const isReplyInputVisible = useRef(false);

  // WebSocket subscription
  useEffect(() => {
    if (postId && currentUser?.id) {
      // Subscribe to post updates
      webSocketService.subscribeToPost(postId, (updatedPost) => {
        // Kiểm tra xem có đang nhập liệu không
        const isTyping = isUserTyping.current;

        // Kiểm tra xem có ô nhập phản hồi nào đang hiển thị không
        const isReplyVisible = isReplyInputVisible.current;

        // Chỉ cập nhật khi không đang nhập liệu và không có ô nhập phản hồi nào đang hiển thị
        if (!isTyping && !isReplyVisible) {
          setPost(prevPost => {
            // Nếu không có post trước đó, thì cập nhật
            if (!prevPost) {
              return updatedPost;
            }

            // Tạo bản sao của updatedPost để tránh tham chiếu trực tiếp
            const newPost = { ...updatedPost };

            // Giữ nguyên các đường dẫn hình ảnh và video từ post cũ
            // để tránh việc tải lại không cần thiết
            if (prevPost.images && newPost.images) {
              newPost.images = [...prevPost.images];
            }
            if (prevPost.videos && newPost.videos) {
              newPost.videos = [...prevPost.videos];
            }

            // Giữ nguyên các bình luận đang được hiển thị
            if (prevPost.comments && newPost.comments) {
              // Chỉ cập nhật nội dung bình luận, không thay đổi trạng thái hiển thị
              newPost.comments = newPost.comments.map(newComment => {
                const oldComment = prevPost.comments.find(c => c.id === newComment.id);
                if (oldComment) {
                  // Giữ lại các trạng thái hiển thị từ bình luận cũ
                  return {
                    ...newComment,
                    // Giữ nguyên các thuộc tính UI nếu có
                  };
                }
                return newComment;
              });
            }

            // Nếu là bài đăng chia sẻ, cũng giữ nguyên hình ảnh của bài gốc
            if (prevPost.originalPost && newPost.originalPost) {
              newPost.originalPost = { ...newPost.originalPost };
              if (prevPost.originalPost.images && newPost.originalPost.images) {
                newPost.originalPost.images = [...prevPost.originalPost.images];
              }
              if (prevPost.originalPost.videos && newPost.originalPost.videos) {
                newPost.originalPost.videos = [...prevPost.originalPost.videos];
              }
            }

            return newPost;
          });
        }
      });

      return () => {
        // Unsubscribe when component unmounts
        webSocketService.unsubscribeFromPost(postId);
      };
    }
  }, [postId, currentUser?.id]);

  // Không cần useEffect này nữa vì việc hiển thị replies được xử lý trong component Comment

  // Cache for image URLs to prevent unnecessary reloads
  const imageUrlCache = useRef(new Map());

  const getFullImageUrl = useCallback((path) => {
    if (!path) return '/default-imgs/avatar.png';
    if (path.startsWith('http') || path.startsWith('blob')) return path;

    // Check if we already have this URL in our cache
    if (imageUrlCache.current.has(path)) {
      return imageUrlCache.current.get(path);
    }

    // Create the full URL
    const fullUrl = `${API_ENDPOINTS.BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

    // Store in cache
    imageUrlCache.current.set(path, fullUrl);

    return fullUrl;
  }, []);

  // Memoized component for avatar to prevent unnecessary re-renders
  const MemoizedAvatar = memo(({ src, alt, className, style, onClick }) => {
    // Use a stable reference for the src to prevent unnecessary re-renders
    const srcRef = useRef(src);

    // Only update the ref if the src has actually changed
    useEffect(() => {
      if (src !== srcRef.current) {
        srcRef.current = src;
      }
    }, [src]);

    return (
      <img
        src={srcRef.current}
        alt={alt}
        className={className}
        style={style}
        onClick={onClick}
        loading="lazy"
      />
    );
  }, (prevProps, nextProps) => {
    // Custom comparison function for memo
    // Only re-render if the src actually changes and is different
    return prevProps.src === nextProps.src;
  });

  // Memoized component for post images to prevent unnecessary re-renders
  const MemoizedPostImage = memo(({ src, alt, className, onClick }) => {
    // Use a stable reference for the src to prevent unnecessary re-renders
    const srcRef = useRef(src);

    // Only update the ref if the src has actually changed
    useEffect(() => {
      if (src !== srcRef.current) {
        srcRef.current = src;
      }
    }, [src]);

    return (
      <img
        src={srcRef.current}
        alt={alt}
        className={className}
        onClick={onClick}
        loading="lazy"
        onError={(e) => {
          console.log('Image load error, using default:', e.target.src);
          e.target.src = '/default-imgs/image-placeholder.png';
        }}
      />
    );
  }, (prevProps, nextProps) => {
    // Custom comparison function for memo
    // Only re-render if the src actually changes
    return prevProps.src === nextProps.src;
  });

  const handleAvatarClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleLike = async () => {
    try {
      await fetch(`${API_ENDPOINTS.BASE_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          userId: currentUser.id
        })
      });
      // WebSocket will update the post
    } catch (error) {
      console.error('Error liking post:', error);
      showError('Failed to like post. Please try again.');
    }
  };

  const handleComment = async (content, parentId = null) => {
    if (!content?.trim() || isLoading[`comment_${parentId || 'new'}`]) return;

    // Đánh dấu người dùng đã ngừng nhập liệu
    isUserTyping.current = false;
    isReplyInputVisible.current = false;

    setIsLoading(prev => ({ ...prev, [`comment_${parentId || 'new'}`]: true }));

    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          content,
          userId: currentUser.id,
          parentId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      // Reset input
      if (!parentId) {
        setCommentInput('');
      }

      // WebSocket will update the post
    } catch (error) {
      console.error('Error adding comment:', error);
      showError('Failed to add comment. Please try again.');
      throw error; // Rethrow error to be caught by the caller
    } finally {
      setIsLoading(prev => ({ ...prev, [`comment_${parentId || 'new'}`]: false }));
    }
  };

  const handleDeleteComment = async (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteCommentModal(true);
  };

  const confirmDeleteComment = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/posts/${postId}/comments/${commentToDelete}?userId=${currentUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      showSuccess('Bình luận đã được xóa thành công');
      // WebSocket will update the post
    } catch (error) {
      console.error('Error deleting comment:', error);
      showError('Không thể xóa bình luận. Vui lòng thử lại.');
    } finally {
      setShowDeleteCommentModal(false);
      setCommentToDelete(null);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          userId: currentUser.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to like comment');
      }

      // WebSocket will update the post
    } catch (error) {
      console.error('Error liking comment:', error);
      showError('Failed to like comment. Please try again.');
    }
  };

  // Không cần các hàm này nữa vì đã được xử lý trong component Comment

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const handleDeletePost = async () => {
    setShowDeleteModal(true);
  };

  const confirmDeletePost = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/posts/${postId}?userId=${currentUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      showSuccess('Post deleted successfully');
      setShowDeleteModal(false);
      navigate('/'); // Redirect to home page
    } catch (error) {
      console.error('Error deleting post:', error);
      showError('Failed to delete post. Please try again.');
      setShowDeleteModal(false);
    }
  };

  const handleEditPost = async (content, privacy) => {
    // Cho phép nội dung trống

    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          content: content || '', // Đảm bảo content không null
          userId: currentUser.id,
          privacy
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      showSuccess('Post updated successfully');
      // WebSocket will update the post
      return true;
    } catch (error) {
      console.error('Error updating post:', error);
      showError('Failed to update post. Please try again.');
      return false;
    }
  };

  const handleEditPostWithMedia = async (content, privacy, media, keepImages, keepVideos) => {
    // Kiểm tra xem có ít nhất một hình ảnh/video không
    if (!content.trim() && (!media || media.length === 0) && (!keepImages || keepImages.length === 0) && (!keepVideos || keepVideos.length === 0)) {
      showError('Bài viết phải có nội dung hoặc ít nhất một hình ảnh/video');
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('content', content || ''); // Đảm bảo content không null
      formData.append('userId', currentUser.id);
      formData.append('privacy', privacy);

      // Add images to keep
      if (keepImages && keepImages.length > 0) {
        keepImages.forEach(image => {
          formData.append('keepImages', image);
        });
      }

      // Add videos to keep
      if (keepVideos && keepVideos.length > 0) {
        keepVideos.forEach(video => {
          formData.append('keepVideos', video);
        });
      }

      // Add new media
      if (media && media.length > 0) {
        media.forEach(file => {
          if (file.type.includes('image')) {
            formData.append('images', file);
          } else if (file.type.includes('video')) {
            formData.append('videos', file);
          }
        });
      }

      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/posts/${postId}/update-with-media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      showSuccess('Post updated successfully');
      // WebSocket will update the post
      return true;
    } catch (error) {
      console.error('Error updating post:', error);
      showError('Failed to update post. Please try again.');
      return false;
    }
  };

  // Comment component - Rewritten to match PostList.js
  const Comment = ({ comment, postId, depth = 0 }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isCommentLoading, setIsCommentLoading] = useState(false);
    const [showAllReplies, setShowAllReplies] = useState(false);

    // For highlighting
    const isHighlightedComment = comment.id === highlightCommentId;
    const [hasScrolled, setHasScrolled] = useState(false);
    const commentRef = isHighlightedComment ? highlightedCommentRef : null;

    const MAX_REPLY_DEPTH = 4;
    const MAX_VISIBLE_REPLIES = 0;

    const canReply = depth < MAX_REPLY_DEPTH;
    const isCommentOwner = currentUser?.id === comment.userId;

    useEffect(() => {
      if (isHighlightedComment && highlightedCommentRef.current && !hasScrolled) {
        setHasScrolled(true);

        const scrollTimeout = setTimeout(() => {
          if (highlightedCommentRef.current) {
            highlightedCommentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setShowReplyInput(true);
          }
        }, 500);

        return () => clearTimeout(scrollTimeout);
      }
    }, []);

    const handleReply = async () => {
      if (!replyContent.trim() || isCommentLoading) return;

      setIsCommentLoading(true);
      try {
        await handleComment(replyContent, comment.id);
        setReplyContent('');
        setShowReplyInput(false);
      } catch (error) {
        console.error('Error in handleReply:', error);
      } finally {
        setIsCommentLoading(false);
      }
    };

    const displayedReplies = showAllReplies
      ? comment.replies
      : comment.replies?.slice(0, MAX_VISIBLE_REPLIES);

    const hasMoreReplies = comment.replies?.length > 0;
    const marginLeft = depth < MAX_REPLY_DEPTH ? `${depth * 32}px` : `${MAX_REPLY_DEPTH * 32}px`;

    if (!currentUser) {
      return null;
    }

    return (
      <div className="comment-thread" style={{ marginLeft }} ref={commentRef}>
        <div className="flex gap-2 mb-2">
          <MemoizedAvatar
            src={getFullImageUrl(comment.user?.avatar)}
            alt="User"
            className="w-8 h-8 rounded-full object-cover cursor-pointer"
            onClick={() => handleAvatarClick(comment.user?.id)}
          />
          <div className="flex-1">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div
                className="font-semibold cursor-pointer"
                onClick={() => handleAvatarClick(comment.user?.id)}
              >
                {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown User'}
              </div>
              <div className="text-gray-800">{comment.content}</div>
            </div>

            <div className="flex items-center mt-1">
              <button
                className={`text-sm ${comment.likes?.includes(currentUser.id) ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-600 mr-2`}
                onClick={() => handleLikeComment(comment.id)}
              >
                Thích {comment.likes?.length > 0 && `(${comment.likes.length})`}
              </button>
              {canReply && (
                <button
                  className="text-sm text-gray-500 hover:text-gray-600 mr-2"
                  onClick={() => setShowReplyInput(!showReplyInput)}
                >
                  Phản hồi
                </button>
              )}
              {isCommentOwner && (
                <button
                  className="text-sm text-red-500 hover:text-red-600 mr-2"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  <i className="bi bi-trash-fill"></i> Xóa
                </button>
              )}
              <span className="text-xs text-gray-500 ml-auto">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>

            {showReplyInput && (
              <div className="flex gap-2 mt-2">
                <MemoizedAvatar
                  src={getFullImageUrl(userProfile?.avatar)}
                  alt="Current user"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full rounded-full border border-gray-300 px-4 py-1 text-sm focus:outline-none focus:border-blue-500"
                      placeholder={`Phản hồi ${comment.user?.firstName}...`}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !isCommentLoading) {
                          e.preventDefault();
                          handleReply();
                        }
                      }}
                    />
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                      onClick={handleReply}
                      disabled={isCommentLoading || !replyContent.trim()}
                    >
                      {isCommentLoading ? (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <i className="bi bi-send-fill"></i>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {hasMoreReplies && (
          <>
            {!showAllReplies && (
              <div className="mb-2">
                <button
                  className="text-sm text-blue-500 hover:text-blue-600"
                  onClick={() => setShowAllReplies(true)}
                >
                  <i className="bi bi-arrow-return-right mr-1"></i>
                  Xem {comment.replies.length} phản hồi
                </button>
              </div>
            )}

            {showAllReplies && (
              <div className="space-y-2">
                {displayedReplies?.map((reply, index) => (
                  <Comment
                    key={reply.id || index}
                    comment={reply}
                    postId={postId}
                    depth={depth + 1}
                  />
                ))}

                {showAllReplies && comment.replies?.length > 0 && (
                  <button
                    className="text-sm text-blue-500 hover:text-blue-600"
                    onClick={() => setShowAllReplies(false)}
                  >
                    <i className="bi bi-chevron-up mr-1"></i>
                    Ẩn phản hồi
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  if (loading || !currentUser) {
    return (
      <div className="container-fluid">
        <div className="row pt-16">
          <LeftSidebar />
          <div className="col-6 offset-3 flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <RightSidebar />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container-fluid">
        <div className="row pt-16">
          <LeftSidebar />
          <div className="col-6 offset-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error || 'Không tìm thấy bài viết'}
              </div>
              <p className="text-gray-600 mt-4">
                {error && error.includes('403')
                  ? 'Bạn không có quyền xem bài viết này. Đây có thể là bài viết riêng tư của người dùng khác.'
                  : 'Bài viết bạn đang tìm kiếm có thể đã bị xóa hoặc tạm thời không khả dụng.'}
              </p>
              <button 
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                onClick={() => navigate('/')}
              >
                Quay lại trang chủ
              </button>
            </div>
          </div>
          <RightSidebar />
        </div>
      </div>
    );
  }

  const isPostOwner = currentUser?.id === post.userId;
  const isSharedPost = post.isShared || post.shared;

  return (
    <div className="container-fluid">
      <div className="row pt-16">
        <LeftSidebar />
        <div className="col-6 offset-3">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <MemoizedAvatar
                src={getFullImageUrl(post.user?.avatar)}
                alt="User"
                className="w-14 h-14 rounded-full object-cover cursor-pointer"
                onClick={() => handleAvatarClick(post.user?.id)}
              />
              <div className="flex-1">
                <div
                  className="text-lg font-semibold text-blue-700 cursor-pointer"
                  onClick={() => handleAvatarClick(post.user?.id)}
                >
                  {post.user ? `${post.user.firstName} ${post.user.lastName}` : 'Unknown User'}
                </div>
                <div className="text-gray-500 text-sm">
                  {new Date(post.createdAt).toLocaleString()}
                </div>
              </div>
              {isPostOwner && (
                <PostOptionsMenu
                  post={post}
                  onDelete={handleDeletePost}
                  onEdit={(content, privacy) => handleEditPost(content, privacy)}
                  onEditWithMedia={(content, privacy, media, keepImages, keepVideos) =>
                    handleEditPostWithMedia(content, privacy, media, keepImages, keepVideos)
                  }
                />
              )}
            </div>

            <div className="mb-4 text-base">
              {isSharedPost ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-3">
                    <p>{post.content}</p>
                  </div>
                  {post.originalPost ? (
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={getFullImageUrl(post.originalPost.user?.avatar)}
                          alt="Original author"
                          className="w-8 h-8 rounded-full object-cover cursor-pointer"
                          onClick={() => handleAvatarClick(post.originalPost.user?.id)}
                        />
                        <div>
                          <div
                            className="font-semibold cursor-pointer"
                            onClick={() => handleAvatarClick(post.originalPost.user?.id)}
                          >
                            {post.originalPost.user ? `${post.originalPost.user.firstName} ${post.originalPost.user.lastName}` : 'Unknown User'}
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-500 text-sm mr-2">
                              {new Date(post.originalPost.createdAt).toLocaleString()}
                            </span>
                            <span className="text-gray-500 text-sm flex items-center">
                              <i className={`bi ${post.originalPost.privacy === 'PUBLIC' ? 'bi-globe' : 'bi-lock-fill'} mr-1`}></i>
                              <span>{post.originalPost.privacy === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p>{post.originalPost.content}</p>

                        {post.originalPost.images?.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {post.originalPost.images.map((image, index) => (
                              <div
                                key={index}
                                className="relative cursor-pointer"
                                onClick={() => {
                                  setSelectedImageIndex(index);
                                  setShowImageViewer(true);
                                }}
                              >
                                <MemoizedPostImage
                                  src={getFullImageUrl(image)}
                                  alt="Post content"
                                  className="w-full h-48 object-cover rounded"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {post.originalPost.videos?.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {post.originalPost.videos.map((video, index) => (
                              <div key={index} className="relative">
                                <video
                                  src={getFullImageUrl(video)}
                                  controls
                                  className="w-full h-48 object-cover rounded"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                      Original post no longer exists
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <p>{post.content}</p>
                  {post.images?.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {post.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative cursor-pointer"
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setShowImageViewer(true);
                          }}
                        >
                          <MemoizedPostImage
                            src={getFullImageUrl(image)}
                            alt="Post content"
                            className="w-full h-48 object-cover rounded"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {post.videos?.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {post.videos.map((video, index) => (
                        <div key={index} className="relative">
                          <video
                            src={getFullImageUrl(video)}
                            controls
                            className="w-full h-48 object-cover rounded"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-4 mb-4">
              <div>
                {post.likes?.length > 0 && (
                  <div className="text-gray-600">
                    <i className="bi bi-hand-thumbs-up-fill text-blue-500 mr-1"></i>
                    <span>{post.likes.length} lượt thích</span>
                  </div>
                )}
              </div>
              <div>
                {post.comments?.length > 0 && (
                  <div className="text-gray-600">
                    <span>{post.comments.length} bình luận</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mb-3 border-t border-b py-2">
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                  post.likes?.includes(currentUser.id) 
                    ? 'text-blue-500 hover:bg-blue-50' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={handleLike}
              >
                <img
                  src={post.likes?.includes(currentUser.id) ? "/img/icons/liked.png" : "/img/icons/like.png"}
                  alt="Thích"
                  className="w-5 h-5"
                />
                <span>Thích</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-gray-600 hover:bg-gray-50">
                <img
                  src="/img/icons/comment.png"
                  alt="Bình luận"
                  className="w-5 h-5"
                />
                <span>Bình luận</span>
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-gray-600 hover:bg-gray-50"
                onClick={handleShareClick}
              >
                <img
                  src="/img/icons/share.png"
                  alt="Chia sẻ"
                  className="w-5 h-5"
                />
                <span>Chia sẻ</span>
              </button>
            </div>

            <div className="mt-4">
              <div className="flex gap-2 items-center mb-4">
                <div className="flex-1 relative">
                  <div className="flex items-center">
                    <MemoizedAvatar
                      src={getFullImageUrl(userProfile?.avatar)}
                      alt="Người dùng hiện tại"
                      className="w-8 h-8 rounded-full object-cover mr-2"
                    />
                    <input
                      type="text"
                      className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="Viết bình luận..."
                      value={commentInput}
                      onChange={(e) => {
                        isUserTyping.current = true;
                        setCommentInput(e.target.value);
                      }}
                      onFocus={() => {
                        isUserTyping.current = true;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleComment(commentInput);
                        }
                      }}
                    />
                    <button
                      className="ml-2 text-blue-500 hover:text-blue-600"
                      onClick={() => handleComment(commentInput)}
                      disabled={isLoading.comment_new || !commentInput?.trim()}
                    >
                      <i className="bi bi-send-fill"></i>
                    </button>
                  </div>

                  <CommentSuggestions
                    postContent={post?.content}
                    imageUrl={post?.images && post.images.length > 0 ? post.images[0] : null}
                    onSelectSuggestion={(suggestion) => setCommentInput(suggestion)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {post.comments?.map((comment, index) => (
                  !comment.parentId && (
                    <Comment
                      key={comment.id || index}
                      comment={comment}
                      postId={post.id}
                    />
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
        <RightSidebar />
      </div>

      {showShareModal && (
        <SharePostModal
          show={showShareModal}
          onHide={() => setShowShareModal(false)}
          post={post}
          currentUser={currentUser}
        />
      )}

      {showImageViewer && post && (
        <ImageViewerModal
          key="image-viewer-modal"
          show={showImageViewer}
          onHide={() => setShowImageViewer(false)}
          images={post.isShared && post.originalPost ? post.originalPost.images : post.images}
          initialIndex={selectedImageIndex}
          getFullImageUrl={getFullImageUrl}
        />
      )}

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa bài viết này?</p>
          <p className="text-red-500">Lưu ý: Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến bài viết này.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDeletePost}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteCommentModal} onHide={() => setShowDeleteCommentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa bình luận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa bình luận này?</p>
          <p className="text-red-500">Lưu ý: Hành động này không thể hoàn tác.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteCommentModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDeleteComment}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PostDetail;
