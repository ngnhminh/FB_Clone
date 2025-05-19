import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { API_ENDPOINTS } from '../../config/api';
import PostForm from '../../components/Post/PostForm';
import PostList from '../../components/Post/PostList';
import { useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import EditProfileModal from '../../components/Profile/EditProfileModal';
import ProfileLeftSide from '../../components/Profile/ProfileLeftSide';

/**
 * Trang hồ sơ người dùng
 * Hiển thị thông tin cá nhân và bài đăng của người dùng
 */
function Profile() {
  const { userId } = useParams();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [imageVersion, setImageVersion] = useState(Date.now()); // State để theo dõi phiên bản hình ảnh cho cache busting
  const [showEditModal, setShowEditModal] = useState(false);

  // Sử dụng UserContext thay vì lấy trực tiếp từ localStorage
  const { currentUser, updateUser } = useUser();
  const { showSuccess, showError } = useToast();

  /**
   * Lấy thông tin hồ sơ và bài đăng của người dùng
   */
  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Xác định profileId dựa trên userId từ URL, currentUser, hoặc localStorage
        let profileId = userId;

        if (!profileId) {
          // Nếu không có userId trong URL, thử lấy từ currentUser
          profileId = currentUser?.id;

          // Nếu vẫn không có, thử lấy từ localStorage
          if (!profileId) {
            try {
              const userData = JSON.parse(localStorage.getItem('userData'));
              profileId = userData?.id;
            } catch (e) {
              console.error('Lỗi khi phân tích dữ liệu người dùng từ localStorage:', e);
            }
          }
        }

        if (!profileId) {
          setError('Không tìm thấy người dùng');
          setIsLoading(false);
          return;
        }

        // Kiểm tra xem có phải hồ sơ của chính mình không
        // Nếu currentUser không có, thử lấy từ localStorage
        let currentUserId = currentUser?.id;
        if (!currentUserId) {
          try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            currentUserId = userData?.id;
          } catch (e) {
            console.error('Lỗi khi phân tích dữ liệu người dùng cho kiểm tra isOwnProfile:', e);
          }
        }
        setIsOwnProfile(profileId === currentUserId);

        // Lấy dữ liệu hồ sơ
        const profileResponse = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PROFILE}/${profileId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        });

        if (!profileResponse.ok) {
          throw new Error('Không thể lấy thông tin hồ sơ');
        }

        const profileData = await profileResponse.json();

        // Lưu trữ dữ liệu hồ sơ đầy đủ
        setProfileData(profileData);

        // Cập nhật imageVersion để buộc render lại hình ảnh
        setImageVersion(Date.now());

        // Lấy bài đăng của người dùng sử dụng endpoint mới
        const postsResponse = await fetch(
          `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.POSTS}/user/${profileId}?viewerId=${currentUser?.id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
          }
        );

        if (!postsResponse.ok) {
          throw new Error('Không thể lấy bài đăng');
        }

        const postsData = await postsResponse.json();
        setPosts(Array.isArray(postsData) ? postsData : []);

      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Luôn cố gắng lấy dữ liệu hồ sơ nếu có token
    const hasToken = !!localStorage.getItem('userToken');
    if (hasToken) {
      fetchProfileAndPosts();
    }
  }, [userId, currentUser?.id]);

  /**
   * Kiểm tra đăng nhập và chuyển hướng nếu cần
   */
  useEffect(() => {
    // Kiểm tra xem có token không thay vì kiểm tra currentUser
    const hasToken = !!localStorage.getItem('userToken');

    // Chỉ chuyển hướng nếu không có token
    if (!hasToken) {
      window.location.href = '/login';
    }
  }, []);

  // Hiển thị thông báo lỗi nếu có
  if (error) {
    return <div className="alert alert-danger m-3">{error}</div>;
  }

  // Hiển thị trạng thái đang tải
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  /**
   * Xử lý khi thêm bài đăng mới
   * @param {Object} newPost - Bài đăng mới
   */
  const handleAddPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  /**
   * Xử lý khi cập nhật hồ sơ
   * @param {Object} updatedUserData - Dữ liệu người dùng đã cập nhật
   */
  const handleProfileUpdate = (updatedUserData) => {
    // Cập nhật state dữ liệu hồ sơ
    setProfileData(updatedUserData);

    // Cập nhật context người dùng
    updateUser(updatedUserData);

    // Buộc render lại hình ảnh với timestamp mới
    setImageVersion(Date.now());
  };

  /**
   * Lấy URL đầy đủ của hình ảnh
   * @param {string} path - Đường dẫn hình ảnh
   * @returns {string} URL đầy đủ của hình ảnh
   */
  const getFullImageUrl = (path) => {
    if (!path) return '/default-imgs/avatar.png';
    if (path.startsWith('http') || path.startsWith('blob')) return path;
    return `${API_ENDPOINTS.BASE_URL}${path.startsWith('/') ? '' : '/'}${path}?v=${imageVersion}`;
  };

  // Định dạng dữ liệu người dùng để hiển thị
  const fullName = profileData ? `${profileData.firstName} ${profileData.lastName}` : '';
  const bio = profileData?.bio || '';
  const avatarUrl = profileData?.avatar ? getFullImageUrl(profileData.avatar) : '/default-imgs/avatar.png';
  const coverUrl = profileData?.coverPhoto ? getFullImageUrl(profileData.coverPhoto) : '/default-imgs/cover.jpg';

  return (
    <div className="profile-container bg-gray-100" style={{ marginTop: '62px' }}>
      {/* Phần ảnh bìa */}
      <div className="cover-photo-section relative h-[300px] bg-[#e9ecef] rounded-b-[10px] overflow-hidden">
        <img
          src={coverUrl}
          alt="Ảnh bìa"
          className="cover-photo w-full h-full object-cover object-center"
          onError={(e) => {
            e.target.src = '/default-imgs/cover.jpg';
          }}
          key={`cover-${imageVersion}`}
        />
      </div>

      {/* Phần thông tin hồ sơ */}
      <div className="profile-header flex items-end relative -top-20 px-5">
        <div className="avatar-section relative flex flex-col items-center">
          <img
            src={avatarUrl}
            alt="Ảnh đại diện"
            className="avatar w-40 h-40 rounded-full object-cover"
            onError={(e) => {
              e.target.src = '/default-imgs/avatar.png';
            }}
            key={`avatar-${imageVersion}`}
          />
        </div>
        <div className="profile-info ml-5">
          <h1 className="profile-name text-[28px] m-0 text-[#1c2526]">{fullName}</h1>
          <p className="profile-bio text-base text-[#606770] my-1">{bio}</p>
          {isOwnProfile && (
            <button
              className="edit-profile-button bg-[#e7f3ff] text-[#1877f2] border-none px-4 py-2 rounded-xl cursor-pointer font-bold hover:bg-[#d8e8ff]"
              onClick={() => setShowEditModal(true)}
              aria-label="Chỉnh sửa hồ sơ"
            >
              Chỉnh sửa hồ sơ
            </button>
          )}
        </div>
      </div>

      {/* Phần nội dung hồ sơ */}
      <div className="profile-content relative -top-10 gap-4 flex max-w-6xl mx-auto">
        <ProfileLeftSide />
        <div className='grow pt-2'>
          {/* Form tạo bài đăng mới (chỉ hiển thị trên hồ sơ của chính mình) */}
          {isOwnProfile && <PostForm onAddPost={handleAddPost} />}
          {/* Danh sách bài đăng */}
          {posts.length > 0 ? (
            <PostList
              posts={posts}
              setPosts={setPosts}
              currentUser={currentUser}
            />
          ) : (
            <p className="text-center mt-3">Chưa có bài đăng nào</p>
          )}
        </div>

      </div>

      {/* Modal chỉnh sửa hồ sơ */}
      {isOwnProfile && (
        <EditProfileModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          userData={profileData}
          onProfileUpdate={handleProfileUpdate}
          onSuccess={(message) => showSuccess(message)}
          onError={(message) => showError(message)}
        />
      )}
    </div>
  );
}

export default Profile;
