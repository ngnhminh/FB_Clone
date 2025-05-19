import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { API_ENDPOINTS } from "../config/api";

/**
 * Component hiển thị thanh bên trái với các liên kết và thông tin người dùng
 */
function LeftSidebar() {
  const { currentUser } = useUser();
  const [userProfile, setUserProfile] = useState(null);

  /**
   * Lấy thông tin hồ sơ người dùng khi component được mount hoặc currentUser thay đổi
   */
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (currentUser?.id) {
          const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/profile/${currentUser.id}`);
          if (response.ok) {
            const data = await response.json();
            setUserProfile(data);
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin hồ sơ người dùng:', error);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  /**
   * Lấy URL đầy đủ của hình ảnh
   * @param {string} path - Đường dẫn hình ảnh
   * @returns {string} URL đầy đủ của hình ảnh
   */
  const getFullImageUrl = (path) => {
    if (!path) return '/default-imgs/avatar.png';
    if (path.startsWith('http')) return path;
    return `${API_ENDPOINTS.BASE_URL}${path}`;
  };

  return (
    <div className="col-3 p-3 fixed top-16 h-[calc(100vh-60px)] overflow-y-auto">
      {/* Thông tin người dùng */}
      <div className="flex items-center p-2 gap-2">
        <Link 
          to="/profile" 
          className="no-underline text-gray-900 hover:text-blue-600 transition-colors" 
          aria-label="Xem hồ sơ cá nhân"
        >
          <div className="flex items-center">
            <img
              src={getFullImageUrl(userProfile?.avatar)}
              alt="Ảnh đại diện"
              className="size-8 rounded-full object-cover"
            />
            <span className="ml-2 text-lg font-medium">
              {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Đang tải...'}
            </span>
          </div>
        </Link>
      </div>

      {/* Danh sách liên kết */}
      <ul className="space-y-2 pl-0 font-medium">
        <li>
          <Link
            to="/friends"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-900 no-underline"
            aria-label="Xem danh sách bạn bè"
          >
            <img
              src="/img/icons/friend.png"
              alt="Biểu tượng bạn bè"
              className="w-6 h-6"
            />
            <span>Bạn bè</span>
          </Link>
        </li>
        <li>
          <Link
            to="/groups"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-900 no-underline"
            aria-label="Xem nhóm"
          >
            <img
              src="/img/icons/groups.png"
              alt="Biểu tượng nhóm"
              className="w-6 h-6"
            />
            <span>Nhóm</span>
          </Link>
        </li>
        <li>
          <Link
            to="/marketplace"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-900 no-underline"
            aria-label="Xem marketplace"
          >
            <img
              src="/img/icons/market.png"
              alt="Biểu tượng marketplace"
              className="w-6 h-6"
            />
            <span>Marketplace</span>
          </Link>
        </li>
        <li>
          <Link
            to="/watch"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-900 no-underline"
            aria-label="Xem video"
          >
            <img
              src="/img/icons/reel.png"
              alt="Biểu tượng video"
              className="w-6 h-6"
            />
            <span>Watch</span>
          </Link>
        </li>
        <li>
          <Link
            to="/memories"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-900 no-underline"
            aria-label="Xem kỷ niệm"
          >
            <img
              src="/img/icons/memories.png"
              alt="Biểu tượng kỷ niệm"
              className="w-6 h-6"
            />
            <span>Kỷ niệm</span>
          </Link>
        </li>
        <li>
          <Link
            to="/more"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-900 no-underline"
            aria-label="Xem thêm"
          >
            <img
              src="/img/icons/plus-sign.png"
              alt="Biểu tượng xem thêm"
              className="w-6 h-6"
            />
            <span>Xem thêm</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default LeftSidebar;
