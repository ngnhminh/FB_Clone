import React, { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { useChat } from '../contexts/ChatContext';
import { useNavigate } from 'react-router-dom';

/**
 * Component hiển thị danh sách bạn bè ở thanh bên phải
 */
function RightSidebar() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const { openChat, unreadCounts } = useChat();
  const navigate = useNavigate();

  // Thêm hàm xử lý click vào avatar
  const handleAvatarClick = (userId, event) => {
    event.stopPropagation(); // Ngăn sự kiện click lan tỏa đến phần tử cha
    navigate(`/profile/${userId}`);
  };

  // Lấy thông tin người dùng trực tiếp từ localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Lỗi khi phân tích dữ liệu người dùng:', error);
      return null;
    }
  };

  const user = getUserData();

  // Tham chiếu để theo dõi xem component có được mount hay không
  const isMounted = useRef(true);

  /**
   * Lấy danh sách bạn bè từ API
   */
  const fetchFriends = async () => {
    try {
      if (!user?.id) {
        return;
      }

      // Lấy token xác thực từ localStorage
      const token = localStorage.getItem('userToken');
      if (!token) {
        return;
      }

      setLoading(true);

      const apiUrl = `/api/friends/list/${user.id}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Đọc response dưới dạng text trước
      const responseText = await response.text();

      // Kiểm tra xem response có trống không
      if (!responseText || responseText.trim() === '') {
        setFriends([]);
        return;
      }

      // Thử chuyển đổi thành JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Lỗi khi phân tích JSON:', parseError);
        setFriends([]);
        return;
      }

      // Kiểm tra dữ liệu trả về
      if (Array.isArray(data)) {
        setFriends(data);
      } else if (data && typeof data === 'object') {
        // Nếu là object có thuộc tính error, có thể là lỗi
        if (data.error) {
          console.error('API trả về lỗi:', data.error);
          setFriends([]);
        } else {
          // Nếu là object khác, thử chuyển thành mảng
          const dataArray = Object.values(data).filter(item => item && typeof item === 'object');

          if (dataArray.length > 0) {
            setFriends(dataArray);
          } else {
            setFriends([]);
          }
        }
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bạn bè:', error);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách bạn bè khi component được mount
  useEffect(() => {
    if (user?.id) {
      fetchFriends();
    }

    return () => {
      isMounted.current = false;
    };
  }, [user?.id]);

  /**
   * Lấy URL đầy đủ của hình ảnh
   * @param {string} path Đường dẫn hình ảnh
   * @returns {string} URL đầy đủ của hình ảnh
   */
  const getFullImageUrl = (path) => {
    if (!path) return '/default-imgs/avatar.png';
    if (path.startsWith('http')) return path;
    return path; // Đường dẫn tương đối sẽ được xử lý bởi proxy
  };

  return (
    <div className="col-3 fixed top-16 right-0 h-[calc(100vh-60px)] overflow-y-auto">
      {/* Phần tiêu đề */}
      <div className="px-3 pt-3 py-2 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h6 className="text-gray-500 font-semibold m-0">Người liên hệ</h6>
          <div className="flex gap-3">
            <i className="bi bi-camera-video text-gray-500 hover:text-gray-700 cursor-pointer" aria-label="Tạo cuộc gọi video"></i>
            <i className="bi bi-search text-gray-500 hover:text-gray-700 cursor-pointer" aria-label="Tìm kiếm bạn bè"></i>
            <i className="bi bi-three-dots text-gray-500 hover:text-gray-700 cursor-pointer" aria-label="Tùy chọn"></i>
          </div>
        </div>
        {loading && (
          <div className="mt-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Danh sách bạn bè */}
      <div className="max-h-[calc(100vh-110px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {loading ? (
          <div className="text-center p-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-500">Đang tải danh sách bạn bè...</p>
          </div>
        ) : Array.isArray(friends) && friends.length > 0 ? (
          <ul className="m-0 p-0">
            {friends.map(friend => (
              <li
                key={friend.id || Math.random()}
                className="px-2 py-2 mx-1 my-1 flex items-center justify-between rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => openChat(friend)}
                aria-label={`Bắt đầu trò chuyện với ${friend.firstName || ''} ${friend.lastName || ''}`}
                role="button"
                tabIndex="0"
              >
                <div className="flex items-center gap-2">
                  <div className="relative group" title="Click để xem hồ sơ">
                    <img
                      src={getFullImageUrl(friend.avatar)}
                      alt={`Ảnh đại diện của ${friend.firstName || ''} ${friend.lastName || ''}`}
                      className="w-9 h-9 rounded-full object-cover cursor-pointer transition-transform duration-200 border-2 border-transparent group-hover:scale-110 group-hover:border-blue-500"
                      onClick={(e) => handleAvatarClick(friend.id, e)}
                      onError={(e) => {
                        e.target.src = '/default-imgs/avatar.png';
                      }}
                    />
                    {/* Chỉ báo trạng thái online */}
                    <span
                      className="absolute w-2 h-2 bg-green-500 rounded-full bottom-0.5 right-0.5 border border-white"
                      aria-label="Đang hoạt động"
                    ></span>
                  </div>
                  <span className="text-gray-900">{`${friend.firstName || ''} ${friend.lastName || ''}`}</span>
                </div>
                {/* Hiển thị số tin nhắn chưa đọc */}
                {unreadCounts[friend.id] > 0 && (
                  <span 
                    className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full" 
                    aria-label={`${unreadCounts[friend.id]} tin nhắn chưa đọc`}
                  >
                    {unreadCounts[friend.id]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 p-3">
            <i className="bi bi-people text-4xl mb-2 block"></i>
            <p>Chưa có bạn bè nào</p>
            <small className="block mt-2">Hãy gửi lời mời kết bạn để bắt đầu kết nối</small>
          </div>
        )}
      </div>
    </div>
  );
}

export default RightSidebar;


