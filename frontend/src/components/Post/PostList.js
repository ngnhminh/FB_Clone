import React, { useState, useEffect, memo, useRef, useCallback } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import './PostList.css';
import SharePostModal from './SharePostModal';
import { webSocketService } from '../../services/websocket';
import { useToast } from '../../context/ToastContext';
import PostOptionsMenu from './PostOptionsMenu';
import ImageViewerModal from './ImageViewerModal';
import { useNavigate } from 'react-router-dom';
import CommentSuggestions from '../CommentSuggestions';
import { Modal, Button } from 'react-bootstrap';

/**
 * Component hiển thị nội dung bài đăng, được memo để tránh render lại không cần thiết
 * @param {Object} props - Props của component
 * @param {Object} props.post - Thông tin bài đăng
 * @param {Function} props.onImageClick - Hàm xử lý khi click vào hình ảnh
 */
const PostContent = memo(({ post, onImageClick }) => {
  const isSharedPost = post.isShared || post.shared;

  /**
   * Lấy URL đầy đủ của hình ảnh avatar
   * @param {string} path - Đường dẫn hình ảnh
   * @returns {string} URL đầy đủ của hình ảnh
   */
  const getFullImageUrl = (path) => {
    if (!path) return '/default-imgs/avatar.png';
    if (path.startsWith('http') || path.startsWith('blob')) return path;
    return `${API_ENDPOINTS.BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  /**
   * Lấy URL đầy đủ của media (hình ảnh, video)
   * @param {string} path - Đường dẫn media
   * @returns {string|null} URL đầy đủ của media hoặc null nếu không có
   */
  const getFullMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('blob')) return path;
    return `${API_ENDPOINTS.BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <div className="space-y-3">
      {isSharedPost && (
        <div className="text-gray-800">
          <p>{post.content}</p>
        </div>
      )}

      {isSharedPost && post.originalPost ? (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={getFullImageUrl(post.originalPost.user?.avatar)}
              alt={post.originalPost.user?.firstName || 'User'}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold">
                {post.originalPost.user
                  ? `${post.originalPost.user.firstName || ''} ${post.originalPost.user.lastName || ''}`
                  : 'Người dùng không xác định'}
              </div>
              <div className="text-sm text-gray-500">
                {post.originalPost.createdAt
                  ? new Date(post.originalPost.createdAt).toLocaleString()
                  : ''}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-gray-800">{post.originalPost.content}</p>

            {post.originalPost.images?.length > 0 && (
              <div className={`grid gap-2 ${post.originalPost.images.length > 1 ? 'grid-cols-2' : ''}`}>
                {post.originalPost.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onImageClick) onImageClick(post.originalPost.images, index);
                    }}
                  >
                    <img
                      src={getFullMediaUrl(image)}
                      alt="Nội dung bài đăng"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}

            {post.originalPost.videos?.length > 0 && (
              <div className={`grid gap-2 ${post.originalPost.videos.length > 1 ? 'grid-cols-2' : ''}`}>
                {post.originalPost.videos.map((video, index) => (
                  <div key={index} className="relative">
                    <video
                      src={getFullMediaUrl(video)}
                      controls
                      className="w-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : !isSharedPost ? (
        <div className="space-y-3">
          <p className="text-gray-800">{post.content}</p>
          {post.images?.length > 0 && (
            <div className={`grid gap-2 ${post.images.length > 1 ? 'grid-cols-2' : ''}`}>
              {post.images.map((image, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onImageClick) onImageClick(post.images, index);
                  }}
                >
                  <img
                    src={getFullMediaUrl(image)}
                    alt="Nội dung bài đăng"
                    className="w-full max-h-[600px] object-cover object-center rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}
          {post.videos?.length > 0 && (
            <div className={`grid gap-2 ${post.videos.length > 1 ? 'grid-cols-2' : ''}`}>
              {post.videos.map((video, index) => (
                <div key={index} className="relative aspect-video">
                  <video
                    src={getFullMediaUrl(video)}
                    controls
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
          Bài đăng gốc không còn tồn tại
        </div>
      )}
    </div>
  );
});

/**
 * Component hiển thị bình luận
 * @param {Object} props - Props của component
 * @param {Object} props.comment - Thông tin bình luận
 * @param {string} props.postId - ID của bài đăng
 * @param {Function} props.onReply - Hàm xử lý khi trả lời bình luận
 * @param {Function} props.onDelete - Hàm xử lý khi xóa bình luận
 * @param {Object} props.currentUser - Thông tin người dùng hiện tại
 * @param {Object} props.userProfile - Thông tin profile người dùng
 * @param {Function} props.getFullImageUrl - Hàm lấy URL đầy đủ của hình ảnh
 * @param {number} props.depth - Độ sâu của bình luận (mặc định: 0)
 */
const Comment = ({ comment, postId, onReply, onDelete, currentUser, userProfile, getFullImageUrl, depth = 0 }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);

  const MAX_REPLY_DEPTH = 4; // Giới hạn độ sâu tối đa (0,1,2,3 = 4 tầng)

  // Kiểm tra xem có thể reply tiếp không
  const canReply = depth < MAX_REPLY_DEPTH;

  // Kiểm tra xem người dùng hiện tại có phải là chủ sở hữu bình luận không
  const isCommentOwner = currentUser?.id === comment.userId;

  if (!currentUser) {
    return null;
  }

  const MAX_VISIBLE_REPLIES = 0; // Mặc định không hiển thị phản hồi con
  const MAX_DEPTH = 4; // Giới hạn độ sâu của nested replies để tránh quá nhiều indent

  /**
   * Xử lý khi trả lời bình luận
   */
  const handleReply = async () => {
    if (!replyContent.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onReply(postId, replyContent, comment.id);
      setReplyContent('');
      setShowReplyInput(false);
    } catch (error) {
      console.error('Lỗi khi trả lời bình luận:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayedReplies = showAllReplies
    ? comment.replies
    : comment.replies?.slice(0, MAX_VISIBLE_REPLIES);

  // Luôn hiển thị nút "Xem thêm phản hồi" nếu có phản hồi con
  const hasMoreReplies = comment.replies?.length > 0;
  const marginLeft = depth < MAX_DEPTH ? `${depth * 32}px` : `${MAX_DEPTH * 32}px`;

  return (
    <div className="space-y-2" style={{ marginLeft }}>
      <div className="flex gap-2">
        <img
          src={getFullImageUrl(comment.user?.avatar)}
          alt="User"
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="font-semibold">
              {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown User'}
            </div>
            <div className="text-gray-800">{comment.content}</div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <button
              className="text-sm text-gray-500 hover:text-gray-700"
              onClick={() => setShowReplyInput(!showReplyInput)}
            >
              Phản hồi
            </button>
            {isCommentOwner && (
              <button
                className="text-sm text-red-500 hover:text-red-700"
                onClick={() => onDelete(postId, comment.id)}
              >
                <i className="bi bi-trash-fill"></i> Xóa
              </button>
            )}
            <span className="text-sm text-gray-500 ml-auto">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>

          {showReplyInput && (
            <div className="flex gap-2 mt-2">
              <img
                src={userProfile?.avatar ? getFullImageUrl(userProfile.avatar) : '/default-imgs/avatar.png'}
                alt="Current user"
                className="w-7 h-7 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = '/default-imgs/avatar.png';
                }}
              />
              <div className="flex-1">
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
                  placeholder={`Phản hồi ${comment.user?.firstName}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                      e.preventDefault();
                      handleReply();
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hiển thị replies */}
      {comment.replies && comment.replies.length > 0 && (
        <>
          {!showAllReplies && (
            <button
              className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
              onClick={() => setShowAllReplies(true)}
            >
              <i className="bi bi-arrow-return-right"></i>
              Xem {comment.replies.length} phản hồi
            </button>
          )}

          {showAllReplies && (
            <div className="space-y-2">
              {displayedReplies?.map((reply, index) => (
                <Comment
                  key={reply.id || index}
                  comment={reply}
                  postId={postId}
                  onReply={onReply}
                  onDelete={onDelete}
                  currentUser={currentUser}
                  userProfile={userProfile}
                  getFullImageUrl={getFullImageUrl}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Component hiển thị một bài đăng, được memo để tránh render lại không cần thiết
 * @param {Object} props - Props của component
 * @param {Object} props.post - Thông tin bài đăng
 * @param {Object} props.currentUser - Thông tin người dùng hiện tại
 * @param {Object} props.userProfile - Thông tin profile người dùng
 * @param {Function} props.handleLike - Hàm xử lý khi thích bài đăng
 * @param {Function} props.handleComment - Hàm xử lý khi bình luận bài đăng
 * @param {Function} props.handleShareClick - Hàm xử lý khi chia sẻ bài đăng
 * @param {Function} props.handleDeletePost - Hàm xử lý khi xóa bài đăng
 * @param {Function} props.handleEditPost - Hàm xử lý khi chỉnh sửa bài đăng
 * @param {Function} props.handleEditPostWithMedia - Hàm xử lý khi chỉnh sửa bài đăng có media
 * @param {Function} props.handleDeleteComment - Hàm xử lý khi xóa bình luận
 * @param {Object} props.commentInputs - Dữ liệu nhập vào của bình luận
 * @param {Function} props.setCommentInputs - Hàm cập nhật dữ liệu nhập vào của bình luận
 * @param {Object} props.isLoading - Trạng thái đang tải
 */
const PostItem = memo(({ post, currentUser, userProfile, handleLike, handleComment, handleShareClick, handleDeletePost, handleEditPost, handleEditPostWithMedia, handleDeleteComment, commentInputs, setCommentInputs, isLoading }) => {
  const navigate = useNavigate();
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  /**
   * Lấy URL đầy đủ của hình ảnh
   * @param {string} path - Đường dẫn hình ảnh
   * @returns {string} URL đầy đủ của hình ảnh
   */
  const getFullImageUrl = useCallback((path) => {
    if (!path) return '/default-imgs/avatar.png';
    if (path.startsWith('http') || path.startsWith('blob')) return path;
    return `${API_ENDPOINTS.BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  }, []);

  /**
   * Xử lý khi click vào avatar
   * @param {string} userId - ID của người dùng
   */
  const handleAvatarClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  // Kiểm tra xem người dùng hiện tại có phải là chủ sở hữu bài viết không
  const isPostOwner = currentUser?.id === post.userId;

  // State cho chế độ chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editPrivacy, setEditPrivacy] = useState(post.privacy || 'PUBLIC');
  const [editMedia, setEditMedia] = useState([]);
  const [editMediaPreview, setEditMediaPreview] = useState([]);
  const [keepImages, setKeepImages] = useState(post.images || []);
  const [keepVideos, setKeepVideos] = useState(post.videos || []);

  /**
   * Xử lý khi thêm media mới khi đang chỉnh sửa
   * @param {Event} e - Sự kiện thay đổi input
   */
  const handleEditMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setEditMedia(prevMedia => [...prevMedia, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setEditMediaPreview(prevPreviews => [...prevPreviews, ...newPreviews]);
    }
  };

  // Dọn dẹp URL blob khi component unmount
  useEffect(() => {
    return () => {
      // Xóa các URL object đã tạo để tránh memory leak
      editMediaPreview.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [editMediaPreview]);

  /**
   * Xử lý khi xóa hình ảnh đã có
   * @param {number} index - Vị trí của hình ảnh
   */
  const handleRemoveExistingImage = (index) => {
    setKeepImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  /**
   * Xử lý khi xóa video đã có
   * @param {number} index - Vị trí của video
   */
  const handleRemoveExistingVideo = (index) => {
    setKeepVideos(prevVideos => prevVideos.filter((_, i) => i !== index));
  };

  /**
   * Xử lý khi xóa media mới thêm vào
   * @param {number} index - Vị trí của media
   */
  const handleRemoveNewMedia = (index) => {
    // Lấy URL của preview để xóa
    const previewUrl = editMediaPreview[index];
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    // Cập nhật state
    setEditMedia(prevMedia => prevMedia.filter((_, i) => i !== index));
    setEditMediaPreview(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  /**
   * Đặt lại trạng thái chỉnh sửa khi hủy
   */
  const resetEditState = () => {
    // Đóng form edit
    setIsEditing(false);

    // Reset các state về giá trị ban đầu
    setEditContent(post.content);
    setEditPrivacy(post.privacy || 'PUBLIC');
    setEditMedia([]);
    setEditMediaPreview([]);
    setKeepImages(post.images || []);
    setKeepVideos(post.videos || []);

    // Xóa các URL object đã tạo để tránh memory leak
    editMediaPreview.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div id={`post-${post.id}`} className="bg-white rounded-lg shadow-sm mb-4">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <img
            src={getFullImageUrl(post.user?.avatar)}
            alt="Người dùng"
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
            onClick={() => handleAvatarClick(post.user?.id)}
          />
          <div className="flex-1">
            <div
              className="font-semibold cursor-pointer"
              onClick={() => handleAvatarClick(post.user?.id)}
            >
              {post.user ? `${post.user.firstName} ${post.user.lastName}` : 'Người dùng không xác định'}
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                {new Date(post.createdAt).toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <i className={`bi ${post.privacy === 'PUBLIC' ? 'bi-globe' : 'bi-lock-fill'} mr-1`}></i>
                <span className="hidden sm:inline">{post.privacy === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}</span>
              </span>
            </div>
          </div>

          {isPostOwner && (
            <div className="relative">
              <PostOptionsMenu
                postId={post.id}
                onEdit={() => setIsEditing(true)}
                onDelete={() => handleDeletePost(post.id)}
              />
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3 mb-3">
            <textarea
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows="3"
              disabled={isLoading[`edit_${post.id}`]}
            ></textarea>

            {/* Media preview section */}
            {(keepImages.length > 0 || keepVideos.length > 0 || editMediaPreview.length > 0) && (
              <div className="grid gap-2 grid-cols-2">
                {/* Existing images */}
                {keepImages.map((image, index) => (
                  <div key={`existing-img-${index}`} className="relative">
                    <img
                      src={getFullImageUrl(image)}
                      alt={`Hình ảnh ${index + 1}`}
                      className="w-full h-[200px] object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      onClick={() => handleRemoveExistingImage(index)}
                      disabled={isLoading[`edit_${post.id}`]}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                ))}

                {/* Existing videos */}
                {keepVideos.map((video, index) => (
                  <div key={`existing-video-${index}`} className="relative">
                    <div className=' aspect-video'>
                      <video
                        src={getFullImageUrl(video)}
                        controls
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    <button
                      type="button"
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      onClick={() => handleRemoveExistingVideo(index)}
                      disabled={isLoading[`edit_${post.id}`]}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                ))}

                {/* New media */}
                {editMediaPreview.map((preview, index) => (
                  <div key={`new-media-${index}`} className="relative">
                    {editMedia[index].type.includes('video') ? (
                      <div className=' aspect-video'>
                        <video
                          src={preview}
                          controls
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                    ) : (
                      <img
                        src={preview}
                        alt={`Hình ảnh mới ${index + 1}`}
                        className="w-full h-[200px] object-cover rounded-lg"
                      />
                    )}
                    <button
                      type="button"
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      onClick={() => handleRemoveNewMedia(index)}
                      disabled={isLoading[`edit_${post.id}`]}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add media button */}
            <div className="flex justify-between items-center">
              <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <i className="bi bi-image mr-2"></i>
                Thêm ảnh/video
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleEditMediaChange}
                  className="hidden"
                  disabled={isLoading[`edit_${post.id}`]}
                  multiple
                />
              </label>

              <div className="flex items-center gap-2">
                <select
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  value={editPrivacy}
                  onChange={(e) => setEditPrivacy(e.target.value)}
                  disabled={isLoading[`edit_${post.id}`]}
                >
                  <option value="PUBLIC">Công khai</option>
                  <option value="PRIVATE">Riêng tư</option>
                </select>

                <button
                  className="px-4 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={resetEditState}
                  disabled={isLoading[`edit_${post.id}`]}
                >
                  Hủy
                </button>
                <button
                  className="px-4 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  onClick={async () => {
                    let success = false;
                    if (editMedia.length > 0 || keepImages.length !== (post.images?.length || 0) || keepVideos.length !== (post.videos?.length || 0)) {
                      success = await handleEditPostWithMedia(post.id, editContent, editPrivacy, editMedia, keepImages, keepVideos);
                    } else {
                      success = await handleEditPost(post.id, editContent, editPrivacy);
                    }
                    if (success) {
                      setIsEditing(false);
                    }
                  }}
                  disabled={isLoading[`edit_${post.id}`]}
                >
                  {isLoading[`edit_${post.id}`] ? (
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang lưu...
                    </div>
                  ) : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="cursor-pointer"
            onClick={() => navigate(`/posts/${post.id}`)}
          >
            <PostContent
              post={post}
              onImageClick={(images, index) => {
                setSelectedImages(images);
                setSelectedImageIndex(index);
                setShowImageViewer(true);
              }}
            />
            {post.privacy === 'PRIVATE' && (
              <div className="mt-1">
                <span className="text-sm text-gray-500">
                  <i className="bi bi-lock-fill mr-1"></i> Riêng tư
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-6 mt-3 border-t border-gray-200 pt-3">
          <button
            className={`flex items-center gap-1 ${post.likes?.includes(currentUser.id) ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-600`}
            onClick={() => handleLike(post.id)}
          >
            <img
              src={post.likes?.includes(currentUser.id) ? "/img/icons/liked.png" : "/img/icons/like.png"}
              alt="Thích"
              className="w-5 h-5"
            />
            <span>{post.likes?.length || 0} Thích</span>
          </button>
          <button
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            onClick={() => navigate(`/posts/${post.id}`)}
          >
            <img
              src="/img/icons/comment.png"
              alt="Bình luận"
              className="w-5 h-5"
            />
            <span>{post.comments?.length || 0} Bình luận</span>
          </button>
          <button
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            onClick={() => handleShareClick(post)}
          >
            <img
              src="/img/icons/share.png"
              alt="Chia sẻ"
              className="w-5 h-5"
            />
            <span>Chia sẻ</span>
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {post.comments?.slice(0, 2).map((comment, index) => (
            !comment.parentId && (
              <Comment
                key={comment.id || index}
                comment={comment}
                postId={post.id}
                onReply={handleComment}
                onDelete={handleDeleteComment}
                currentUser={currentUser}
                userProfile={userProfile}
                getFullImageUrl={getFullImageUrl}
              />
            )
          ))}
          {post.comments?.length > 2 && (
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() => navigate(`/posts/${post.id}`)}
            >
              Xem thêm {post.comments.length - 2} bình luận
            </button>
          )}

          <div className="flex items-center gap-2">
            <img
              src={userProfile?.avatar ? getFullImageUrl(userProfile.avatar) : '/default-imgs/avatar.png'}
              alt="Current user"
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.target.src = '/default-imgs/avatar.png';
              }}
            />
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
                placeholder="Viết bình luận..."
                value={commentInputs[post.id] || ''}
                onChange={(e) => setCommentInputs(prev => ({
                  ...prev,
                  [post.id]: e.target.value
                }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading[post.id]) {
                    handleComment(post.id, e.target.value);
                  }
                }}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700"
                onClick={() => !isLoading[post.id] && handleComment(post.id, commentInputs[post.id])}
                disabled={isLoading[post.id] || !commentInputs[post.id]?.trim()}
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showImageViewer && (
        <ImageViewerModal
          show={showImageViewer}
          onHide={() => setShowImageViewer(false)}
          images={selectedImages}
          initialIndex={selectedImageIndex}
          getFullImageUrl={getFullImageUrl}
        />
      )}
    </div>
  );
});

const PostList = ({ posts: initialPosts, currentUser }) => {
  const [posts, setPosts] = useState(initialPosts || []);
  const [commentInputs, setCommentInputs] = useState({});
  const [isLoading, setIsLoading] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const listRef = useRef(null);
  const subscribedPosts = useRef(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(!!currentUser);
  const { showSuccess, showError } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);

  // Sort posts by createdAt in descending order (newest first)
  useEffect(() => {
    if (Array.isArray(initialPosts)) {
      const sortedPosts = [...initialPosts].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
      setPosts(sortedPosts.filter(post => post && post.id));
    }
  }, [initialPosts]);

  // Sort posts when receiving WebSocket updates
  const handleWebSocketUpdate = useCallback((updatedPost) => {
    setPosts(prevPosts => {
      const newPosts = prevPosts.map(post =>
        post.id === updatedPost.id ? updatedPost : post
      );
      return newPosts.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
    });
  }, []);

  // Handle post highlighting when postId is in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');

    if (postId) {
      // Check if we're coming from a notification click
      const isFromNotification = document.referrer.includes('/notifications') ||
                               document.referrer.includes('/friends') ||
                               document.referrer.includes('/profile');

      if (isFromNotification) {
        // Wait for posts to be loaded
      const checkAndHighlightPost = () => {
          const postElement = document.getElementById(`post-${postId}`);
        if (postElement) {
          postElement.scrollIntoView({ behavior: 'smooth' });
          postElement.classList.add('highlight-post');
          setTimeout(() => {
            postElement.classList.remove('highlight-post');
          }, 2000);
        } else {
            // If post not found yet, try again after a short delay
          setTimeout(checkAndHighlightPost, 100);
        }
      };

      checkAndHighlightPost();
    }
    }
  }, [posts]); // Re-run when posts change

  // Fetch user profile to get avatar
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!currentUser?.id) return;

        const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/profile/${currentUser.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [currentUser?.id]);

  const handleShareSuccess = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handleLike = async (postId) => {
    try {
      await fetch(`${API_ENDPOINTS.POSTS}/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          userId: JSON.parse(localStorage.getItem('userData')).id
        })
      });
      // Không cần setPosts vì sẽ nhận update qua WebSocket
    } catch (error) {
      console.error('Lỗi khi thích bài đăng:', error);
      alert('Không thể thích bài đăng. Vui lòng thử lại.');
    }
  };

  const handleComment = async (postId, content, parentId = null) => {
    if (!content?.trim() || isLoading[postId]) return;

    setIsLoading(prev => ({ ...prev, [postId]: true }));
    try {
      const response = await fetch(`${API_ENDPOINTS.POSTS}/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          content: content,
          parentId: parentId,
          userId: currentUser.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Kiểm tra message từ backend
        if (data === "Maximum reply depth reached") {
          throw new Error("Maximum reply depth reached");
        }
        throw new Error(data || 'Lỗi kết nối mạng');
      }

      // Không cần thêm comment vào UI ngay lập tức vì sẽ nhận update qua WebSocket
      // Chỉ cần xóa nội dung input
      if (!parentId) {
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (error) {
      console.error('Lỗi khi bình luận:', error);
      if (error.message === "Maximum reply depth reached") {
        alert('Không thể trả lời thêm. Đã đạt giới hạn độ sâu của bình luận.');
      } else {
        alert("Đã đạt giới hạn phản hồi bình luận");
      }
      throw error; // Thêm dòng này để propagate error lên component cha
    } finally {
      setIsLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleShareClick = (post) => {
    setSelectedPost(post);
    setShowShareModal(true);
  };

  // Xử lý xóa bài viết
  const handleDeletePost = async (postId) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  // Thực hiện xóa bài viết sau khi xác nhận
  const confirmDeletePost = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/posts/${postToDelete}?userId=${currentUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Bạn không có quyền xóa bài viết này');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể xóa bài viết');
      }

      // Xóa bài viết khỏi UI
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postToDelete));
      showSuccess('Xóa bài viết thành công');

      // Hủy đăng ký WebSocket
      webSocketService.unsubscribeFromPost(postToDelete);
      subscribedPosts.current.delete(postToDelete);
      
      // Đóng modal
      setShowDeleteModal(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Lỗi khi xóa bài viết:', error);
      showError(error.message || 'Không thể xóa bài viết. Vui lòng thử lại.');
      setShowDeleteModal(false);
    }
  };

  // Xử lý sửa bài viết (chỉ nội dung và quyền riêng tư)
  const handleEditPost = async (postId, content, privacy) => {
    // Cho phép nội dung trống

    // Cập nhật trạng thái loading
    setIsLoading(prev => ({ ...prev, [`edit_${postId}`]: true }));

    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          content: content,
          userId: currentUser.id,
          privacy: privacy
        })
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Bạn không có quyền sửa bài viết này');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể cập nhật bài viết');
      }

      const updatedPost = await response.json();

      // Cập nhật bài viết trong UI
      setPosts(prevPosts => {
        // Tìm bài viết cần cập nhật
        const postIndex = prevPosts.findIndex(p => p.id === postId);
        if (postIndex === -1) return prevPosts;

        // Tạo bản sao của mảng posts
        const newPosts = [...prevPosts];

        // Cập nhật bài viết với dữ liệu mới
        newPosts[postIndex] = {
          ...newPosts[postIndex],
          content: updatedPost.content,
          privacy: updatedPost.privacy
        };

        return newPosts;
      });

      showSuccess('Cập nhật bài viết thành công');
      return true; // Trả về true để component PostItem biết là cập nhật thành công
    } catch (error) {
      console.error('Lỗi khi cập nhật bài viết:', error);
      showError(error.message || 'Không thể cập nhật bài viết. Vui lòng thử lại.');
      return false;
    } finally {
      // Reset trạng thái loading
      setIsLoading(prev => ({ ...prev, [`edit_${postId}`]: false }));
    }
  };

  // Xử lý sửa bài viết có kèm media
  const handleEditPostWithMedia = async (postId, content, privacy, media, keepImages, keepVideos) => {
    // Cho phép nội dung trống nếu có ít nhất một hình ảnh hoặc video
    if (!content.trim() && (!media || media.length === 0) && (!keepImages || keepImages.length === 0) && (!keepVideos || keepVideos.length === 0)) {
      showError('Bài viết phải có nội dung hoặc ít nhất một hình ảnh/video');
      return;
    }

    // Cập nhật trạng thái loading
    setIsLoading(prev => ({ ...prev, [`edit_${postId}`]: true }));

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('userId', currentUser.id);
      formData.append('privacy', privacy);

      // Thêm các hình ảnh giữ lại
      if (keepImages && keepImages.length > 0) {
        keepImages.forEach(image => {
          formData.append('keepImages', image);
        });
      }

      // Thêm các video giữ lại
      if (keepVideos && keepVideos.length > 0) {
        keepVideos.forEach(video => {
          formData.append('keepVideos', video);
        });
      }

      // Thêm các media mới
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
        if (response.status === 403) {
          throw new Error('Bạn không có quyền sửa bài viết này');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể cập nhật bài viết');
      }

      const updatedPost = await response.json();

      // Cập nhật bài viết trong UI
      setPosts(prevPosts => {
        // Tìm bài viết cần cập nhật
        const postIndex = prevPosts.findIndex(p => p.id === postId);
        if (postIndex === -1) return prevPosts;

        // Tạo bản sao của mảng posts
        const newPosts = [...prevPosts];

        // Cập nhật bài viết với dữ liệu mới
        newPosts[postIndex] = {
          ...newPosts[postIndex],
          content: updatedPost.content,
          privacy: updatedPost.privacy,
          images: updatedPost.images || [],
          videos: updatedPost.videos || []
        };

        return newPosts;
      });

      showSuccess('Cập nhật bài viết thành công');
      return true; // Trả về true để component PostItem biết là cập nhật thành công
    } catch (error) {
      console.error('Lỗi khi cập nhật bài viết:', error);
      showError(error.message || 'Không thể cập nhật bài viết. Vui lòng thử lại.');
      return false;
    } finally {
      // Reset trạng thái loading
      setIsLoading(prev => ({ ...prev, [`edit_${postId}`]: false }));
    }
  };

  // Xử lý xóa bình luận
  const handleDeleteComment = async (postId, commentId) => {
    setCommentToDelete({ postId, commentId });
    setShowDeleteCommentModal(true);
  };

  // Thực hiện xóa bình luận sau khi xác nhận
  const confirmDeleteComment = async () => {
    const { postId, commentId } = commentToDelete;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/posts/${postId}/comments/${commentId}?userId=${currentUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Bạn không có quyền xóa bình luận này');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể xóa bình luận');
      }

      const updatedPost = await response.json();

      // Cập nhật bài viết với bình luận đã xóa
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? updatedPost : post
        )
      );

      showSuccess('Xóa bình luận thành công');
    } catch (error) {
      console.error('Lỗi khi xóa bình luận:', error);
      showError(error.message || 'Không thể xóa bình luận. Vui lòng thử lại.');
    } finally {
      setShowDeleteCommentModal(false);
      setCommentToDelete(null);
    }
  };

  // WebSocket setup for real-time updates
  useEffect(() => {
    let isComponentMounted = true;
    let retryTimeout = null;
    const currentSubscribedPosts = subscribedPosts.current;

    const setupWebSocket = async () => {
      try {
        console.log('PostList: Setting up WebSocket connection');
        await webSocketService.connect();

        if (!isComponentMounted) return;

        if (posts && posts.length > 0) {
          // Unsubscribe from posts that are no longer in the list
          const currentPostIds = new Set(posts.map(post => post?.id).filter(Boolean));
          const postsToUnsubscribe = [...currentSubscribedPosts].filter(postId => !currentPostIds.has(postId));

          postsToUnsubscribe.forEach(postId => {
            console.log(`PostList: Unsubscribing from post ${postId} as it's no longer in the list`);
            webSocketService.unsubscribeFromPost(postId);
            currentSubscribedPosts.delete(postId);
          });

          // Subscribe to new posts
          for (const post of posts) {
            if (!post?.id || currentSubscribedPosts.has(post.id)) continue;

            console.log(`PostList: Subscribing to post ${post.id}`);
            currentSubscribedPosts.add(post.id);
            try {
              await webSocketService.subscribeToPost(post.id, handleWebSocketUpdate);
            } catch (error) {
              console.error(`PostList: Failed to subscribe to post ${post.id}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('PostList: Failed to setup WebSocket:', error);
        if (isComponentMounted) {
          retryTimeout = setTimeout(setupWebSocket, 5000);
        }
      }
    };

    setupWebSocket();

    return () => {
      console.log('PostList: Cleaning up WebSocket subscriptions');
      isComponentMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }

      currentSubscribedPosts.forEach(postId => {
        console.log(`PostList: Unsubscribing from post ${postId} during cleanup`);
        webSocketService.unsubscribeFromPost(postId);
      });
      currentSubscribedPosts.clear();
    };
  }, [posts, handleWebSocketUpdate]);

  // Cập nhật isLoggedIn khi currentUser thay đổi
  useEffect(() => {
    setIsLoggedIn(!!currentUser);
  }, [currentUser]);

  if (!isLoggedIn) {
    return <div className="alert alert-warning">Vui lòng đăng nhập để xem bài viết</div>;
  }

  return (
    <div className="post-list-container shadow-sm rounded-xl" ref={listRef} style={{ overflowY: 'auto' }}>
      {Array.isArray(posts) && posts.map((post) => (
        post && post.id ? (
          <PostItem
            key={post.id}
            post={post}
            currentUser={currentUser}
            userProfile={userProfile}
            handleLike={handleLike}
            handleComment={handleComment}
            handleShareClick={handleShareClick}
            handleDeletePost={handleDeletePost}
            handleEditPost={handleEditPost}
            handleEditPostWithMedia={handleEditPostWithMedia}
            handleDeleteComment={handleDeleteComment}
            commentInputs={commentInputs}
            setCommentInputs={setCommentInputs}
            isLoading={isLoading}
          />
        ) : null
      ))}
      {showShareModal && selectedPost && (
        <SharePostModal
          show={showShareModal}
          onHide={() => setShowShareModal(false)}
          post={selectedPost}
          onShareSuccess={handleShareSuccess}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa bài viết này?</p>
          <p className="text-danger">Lưu ý: Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến bài viết này.</p>
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

      {/* Delete Comment Confirmation Modal */}
      <Modal show={showDeleteCommentModal} onHide={() => setShowDeleteCommentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa bình luận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa bình luận này?</p>
          <p className="text-danger">Lưu ý: Hành động này không thể hoàn tác.</p>
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
}

export default memo(PostList);
