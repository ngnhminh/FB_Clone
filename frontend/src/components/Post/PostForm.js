import React, { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../context/ToastContext';

/**
 * Component form tạo bài đăng mới
 * @param {Object} props - Props của component
 * @param {Function} props.onAddPost - Hàm callback khi tạo bài đăng thành công
 */
function PostForm({ onAddPost }) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [privacy, setPrivacy] = useState('PUBLIC'); // Mặc định là PUBLIC

  const { showSuccess, showError } = useToast();
  const currentUser = JSON.parse(localStorage.getItem('userData'));

  /**
   * Lấy thông tin hồ sơ người dùng khi component được mount
   */
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!currentUser?.id) {
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
        setError(null);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin hồ sơ người dùng:', error);
        setError('Không thể tải thông tin hồ sơ người dùng');
        // Nếu token hết hạn, chuyển về trang login
        if (error.message.includes('401')) {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    };

    fetchUserProfile();
  }, [currentUser?.id]);

  /**
   * Dọn dẹp URL blob khi component unmount
   */
  useEffect(() => {
    return () => {
      // Xóa các URL object đã tạo để tránh memory leak
      mediaPreview.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [mediaPreview]);

  /**
   * Lấy URL đầy đủ của hình ảnh
   * @param {string} path - Đường dẫn hình ảnh
   * @returns {string} URL đầy đủ của hình ảnh
   */
  const getFullImageUrl = (path) => {
    if (!path) return '/default-imgs/avatar.png';
    if (path.startsWith('http') || path.startsWith('blob')) return path;
    return `${API_ENDPOINTS.BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  /**
   * Xử lý khi thêm media mới
   * @param {Event} e - Sự kiện thay đổi input
   */
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setMedia(prevMedia => [...prevMedia, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setMediaPreview(prevPreviews => [...prevPreviews, ...newPreviews]);
    }
  };

  /**
   * Xử lý khi xóa media
   * @param {number} index - Vị trí của media cần xóa
   */
  const handleRemoveMedia = (index) => {
    // Lấy URL của preview để xóa
    const previewUrl = mediaPreview[index];
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    // Cập nhật state
    setMedia(prevMedia => prevMedia.filter((_, i) => i !== index));
    setMediaPreview(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  /**
   * Xử lý khi gửi form tạo bài đăng mới
   * @param {Event} e - Sự kiện submit form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) return;

    setIsLoading(true);
    try {
      // Tạo FormData để gửi dữ liệu
      const formData = new FormData();
      formData.append('content', content);
      formData.append('userId', currentUser.id);
      formData.append('privacy', privacy);

      // Thêm các file media vào FormData
      if (media.length > 0) {
        media.forEach((file) => {
          if (file.type.includes('image')) {
            formData.append('images', file);
          } else if (file.type.includes('video')) {
            formData.append('videos', file);
          }
        });
      }

      // Gửi request tạo bài đăng mới
      const response = await fetch(`${API_ENDPOINTS.POSTS}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Không thể tạo bài đăng');
      }

      // Xử lý dữ liệu trả về
      const newPost = await response.json();

      // Thêm thông tin người dùng nếu không có
      if (!newPost.user) {
        newPost.user = {
          id: currentUser.id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          avatar: userProfile?.avatar
        };
      }

      // Chuyển đổi đường dẫn hình ảnh và video thành URL đầy đủ
      if (newPost.images) {
        newPost.images = newPost.images.map(image =>
          image.startsWith('http') ? image : `${API_ENDPOINTS.BASE_URL}${image}`
        );
      }
      if (newPost.videos) {
        newPost.videos = newPost.videos.map(video =>
          video.startsWith('http') ? video : `${API_ENDPOINTS.BASE_URL}${video}`
        );
      }

      // Gọi callback để thêm bài đăng mới vào danh sách
      onAddPost(newPost);
      showSuccess('Đăng bài viết thành công');

      // Reset form
      handleCancel();
    } catch (error) {
      console.error('Lỗi khi tạo bài đăng:', error);
      showError('Không thể đăng bài viết. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý khi hủy tạo bài đăng
   * Reset form về trạng thái ban đầu
   */
  const handleCancel = () => {
    // Xóa các URL object đã tạo để tránh memory leak
    mediaPreview.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    // Reset các state
    setContent('');
    setMedia([]);
    setMediaPreview([]);
    setPrivacy('PUBLIC');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4">
      <div className="p-4">
        {/* Phần nhập nội dung bài đăng */}
        <div className="flex items-center gap-2 mb-3">
          <img
            src={getFullImageUrl(userProfile?.avatar)}
            alt="Ảnh đại diện"
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              e.target.src = '/default-imgs/avatar.png';
            }}
          />
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
            placeholder="Bạn đang nghĩ gì?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            aria-label="Nội dung bài đăng"
          />
        </div>

        {/* Hiển thị xem trước media đã chọn */}
        {mediaPreview.length > 0 && (
          <div className="mb-3">
            <div className={`grid gap-2 ${mediaPreview.length > 1 ? 'grid-cols-2' : ''}`}>
              {mediaPreview.map((preview, index) => (
                <div key={index} className="relative group">
                  {media[index].type.includes('video') ? (
                    <video
                      src={preview}
                      controls
                      className="w-full h-[300px] object-cover rounded-lg"
                    />
                  ) : (
                    <img
                      src={preview}
                      alt={`Hình ảnh ${index + 1}`}
                      className="w-full h-[300px] object-cover rounded-lg"
                    />
                  )}
                  <button
                    type="button"
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    onClick={() => handleRemoveMedia(index)}
                    disabled={isLoading}
                    aria-label={`Xóa ${media[index].type.includes('video') ? 'video' : 'hình ảnh'} ${index + 1}`}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Các nút chức năng */}
        <div className="flex justify-between mb-3">
          <button
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            disabled={isLoading}
            aria-label="Tạo video trực tiếp"
          >
            <img src="/img/icons/post-live.png" alt="Biểu tượng live" className="w-5 h-5" />
            Video trực tiếp
          </button>
          <label htmlFor="media-upload" className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer">
            <img src="/img/icons/post-picture.png" alt="Biểu tượng ảnh/video" className="w-5 h-5" />
            Ảnh/Video
            <input
              id="media-upload"
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className="hidden"
              disabled={isLoading}
              multiple
              aria-label="Thêm ảnh hoặc video"
            />
          </label>
          <button
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            disabled={isLoading}
            aria-label="Thêm cảm xúc hoặc hoạt động"
          >
            <img src="/img/icons/post-feeling.png" alt="Biểu tượng cảm xúc" className="w-5 h-5" />
            Cảm xúc/Hoạt động
          </button>
        </div>

        {/* Phần quyền riêng tư và nút đăng */}
        <div className="flex justify-between items-center">
          <div className="privacy-selector">
            <select
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              disabled={isLoading}
              aria-label="Chọn quyền riêng tư"
            >
              <option value="PUBLIC">Công khai</option>
              <option value="PRIVATE">Riêng tư</option>
            </select>
          </div>

          <div className="flex gap-2">
            {/* Nút hủy chỉ hiển thị khi có nội dung hoặc media */}
            {(content.trim() || media.length > 0) && (
              <button
                className="px-4 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                onClick={handleCancel}
                disabled={isLoading}
                aria-label="Hủy tạo bài đăng"
              >
                Hủy
              </button>
            )}
            <button
              className="px-4 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isLoading || (!content.trim() && media.length === 0)}
              aria-label="Đăng bài viết"
            >
              {isLoading ? (
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang đăng...
                </div>
              ) : 'Đăng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostForm;
