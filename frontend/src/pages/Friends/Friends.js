import React, { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useNavigate } from 'react-router-dom';

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

/**
 * Trang quản lý bạn bè
 * Hiển thị danh sách bạn bè, lời mời kết bạn và gợi ý bạn bè
 */
function Friends() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('requests');
  const friendsPerPage = 6;
  const currentUser = JSON.parse(localStorage.getItem('userData'));
  const navigate = useNavigate();

  // Tham chiếu để theo dõi xem component có đang được mount hay không
  const isMounted = useRef(true);

  /**
   * Xử lý khi click vào avatar để xem profile
   * @param {string} userId - ID của người dùng
   * @param {Event} event - Sự kiện click
   */
  const handleAvatarClick = (userId, event) => {
    event.stopPropagation(); // Ngăn sự kiện click lan tỏa đến phần tử cha
    navigate(`/profile/${userId}`);
  };

  /**
   * Lấy dữ liệu bạn bè, lời mời kết bạn hoặc gợi ý bạn bè dựa trên tab đang active
   */
  const fetchData = async () => {
    try {
      let endpoint;
      switch (activeTab) {
        case 'requests':
          endpoint = `${API_ENDPOINTS.BASE_URL}/api/friends/requests/${currentUser.id}`;
          const requestsResponse = await fetch(endpoint);
          const requestsData = await requestsResponse.json();
          setRequests(requestsData);
          break;
        case 'friends':
          endpoint = `${API_ENDPOINTS.BASE_URL}/api/friends/list/${currentUser.id}`;
          const friendsResponse = await fetch(endpoint);
          const friendsData = await friendsResponse.json();
          setFriends(friendsData);
          break;
        case 'suggestions':
          endpoint = `${API_ENDPOINTS.BASE_URL}/api/friends/suggestions/${currentUser.id}`;
          const suggestionsResponse = await fetch(endpoint);
          const suggestionsData = await suggestionsResponse.json();
          setSuggestions(suggestionsData);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    }
  };

  /**
   * Thiết lập lấy dữ liệu định kỳ
   * @returns {number} ID của interval để có thể clear khi cần
   */
  const setupPeriodicDataFetch = () => {
    // Lấy dữ liệu mới mỗi 10 giây
    return setInterval(() => {
      if (isMounted.current && currentUser?.id) {
        fetchData();
      }
    }, 10000); // 10 giây
  };

  /**
   * Lấy dữ liệu khi component được mount hoặc khi tab thay đổi
   */
  useEffect(() => {
    fetchData();

    // Thiết lập lấy dữ liệu định kỳ
    const periodicFetchInterval = setupPeriodicDataFetch();

    // Cleanup function
    return () => {
      clearInterval(periodicFetchInterval);
      isMounted.current = false;
    };
  }, [activeTab, currentUser.id]);

  /**
   * Xử lý các hành động liên quan đến bạn bè (chấp nhận, từ chối, hủy kết bạn, thêm bạn)
   * @param {string} id - ID của yêu cầu kết bạn hoặc người dùng
   * @param {string} action - Hành động cần thực hiện ('accept', 'reject', 'unfriend', 'add')
   */
  const handleFriendAction = async (id, action) => {
    try {
      let endpoint;
      let method;
      let body;

      // Cập nhật UI ngay lập tức trước khi gửi request để tạo trải nghiệm mượt mà hơn
      switch (action) {
        case 'accept':
          // Xóa khỏi danh sách yêu cầu và thêm vào danh sách bạn bè
          if (activeTab === 'requests') {
            const requestToAccept = requests.find(req => req.requestId === id);
            if (requestToAccept && requestToAccept.user) {
              // Xóa khỏi danh sách yêu cầu
              setRequests(prev => prev.filter(req => req.requestId !== id));

              // Thêm vào danh sách bạn bè ngay lập tức
              const newFriend = requestToAccept.user;

              // Thêm vào danh sách bạn bè ngay lập tức
              setFriends(prev => {
                const exists = prev.some(friend => friend.id === newFriend.id);
                if (!exists) {
                  return [...prev, newFriend];
                }
                return prev;
              });
            }
          }
          endpoint = `${API_ENDPOINTS.BASE_URL}/api/friends/respond`;
          method = 'POST';
          body = JSON.stringify({
            requestId: id,
            response: 'ACCEPTED'
          });
          break;

        case 'reject':
          // Xóa khỏi danh sách yêu cầu
          if (activeTab === 'requests') {
            setRequests(prev => prev.filter(req => req.requestId !== id));
          }
          endpoint = `${API_ENDPOINTS.BASE_URL}/api/friends/respond`;
          method = 'POST';
          body = JSON.stringify({
            requestId: id,
            response: 'REJECTED'
          });
          break;

        case 'unfriend':
          // Xóa khỏi danh sách bạn bè
          if (activeTab === 'friends') {
            setFriends(prev => prev.filter(friend => friend.id !== id));
          }
          endpoint = `${API_ENDPOINTS.BASE_URL}/api/friends/${currentUser.id}/${id}`;
          method = 'DELETE';
          break;

        case 'add':
          // Đánh dấu đã gửi lời mời kết bạn
          if (activeTab === 'suggestions') {
            // Xóa khỏi danh sách gợi ý
            setSuggestions(prev => prev.filter(user => user.id !== id));
          }
          endpoint = `${API_ENDPOINTS.BASE_URL}/api/friends/request`;
          method = 'POST';
          body = JSON.stringify({
            userId: currentUser.id,
            friendId: id
          });
          break;
      }

      try {
        // Gửi request API
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          },
          body
        });

        // Lấy nội dung phản hồi
        const responseText = await response.text();

        // Phân tích phản hồi nếu là JSON
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          // Phản hồi không phải là JSON
        }

        if (!response.ok) {
          throw new Error(responseData?.error || responseData?.message || 'Hành động thất bại');
        }

        // Lấy dữ liệu mới nhất từ server sau khi thực hiện hành động
        // để đảm bảo UI đồng bộ với server
        setTimeout(() => {
          fetchData();
        }, 500); // Đợi 500ms để server có thời gian xử lý

        return responseData;
      } catch (error) {
        console.error('Lỗi mạng hoặc phân tích dữ liệu:', error);
        throw error;
      }

    } catch (error) {
      console.error('Lỗi trong handleFriendAction:', error);
      alert(`Không thể thực hiện hành động: ${error.message}. Vui lòng thử lại.`);
      // Nếu có lỗi, cập nhật lại dữ liệu để đồng bộ với server
      fetchData();
    }
  };

  // Lọc dữ liệu hiển thị dựa trên tab đang active
  const filteredData = activeTab === 'suggestions'
    ? suggestions
    : activeTab === 'requests'
      ? requests
      : friends;

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredData.length / friendsPerPage);
  const startIndex = (currentPage - 1) * friendsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + friendsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Thanh bên trái */}
      <div className="w-64 bg-white shadow-sm p-4 pl-0">
        <h4 className="text-xl font-semibold mb-4">Bạn bè</h4>
        <ul className="space-y-2 pl-0">
          <li>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'requests' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => { setActiveTab('requests'); setCurrentPage(1); }}
              aria-label="Xem yêu cầu kết bạn"
            >
              Yêu cầu kết bạn
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'friends' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => { setActiveTab('friends'); setCurrentPage(1); }}
              aria-label="Xem danh sách bạn bè"
            >
              Danh sách bạn bè
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'suggestions' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => { setActiveTab('suggestions'); setCurrentPage(1); }}
              aria-label="Xem gợi ý bạn bè"
            >
              Gợi ý bạn bè
            </button>
          </li>
        </ul>
      </div>

      {/* Nội dung chính */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">
          {activeTab === 'requests' ? 'Lời mời kết bạn' : activeTab === 'friends' ? 'Danh sách bạn bè' : 'Gợi ý bạn bè'}
        </h1>

        {/* Hiển thị thông báo nếu không có dữ liệu */}
        {currentItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {activeTab === 'requests'
              ? 'Chưa có lời mời kết bạn nào.'
              : activeTab === 'friends'
                ? 'Bạn chưa có bạn bè nào.'
                : 'Không có gợi ý bạn bè nào.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Danh sách người dùng */}
            {currentItems.map((item) => (
              <div key={item.requestId || (item.user && item.user.id) || item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative aspect-square">
                  <img
                    src={getFullImageUrl(item.user?.avatar || item.avatar)}
                    alt={`Ảnh đại diện của ${item.user?.firstName || item.firstName} ${item.user?.lastName || item.lastName}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={(e) => handleAvatarClick(item.user?.id || item.id, e)}
                  />
                </div>
                <div className="p-4">
                  <h5 
                    className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors mb-3"
                    onClick={(e) => handleAvatarClick(item.user?.id || item.id, e)}
                  >
                    {item.user ? `${item.user.firstName} ${item.user.lastName}` : `${item.firstName} ${item.lastName}`}
                  </h5>
                  <div className="space-y-2">
                    {/* Nút cho tab yêu cầu kết bạn */}
                    {activeTab === 'requests' && (
                      <div className="flex gap-2">
                        <button
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                          onClick={() => handleFriendAction(item.requestId, 'accept')}
                          aria-label={`Chấp nhận lời mời kết bạn từ ${item.user?.firstName} ${item.user?.lastName}`}
                        >
                          Chấp nhận
                        </button>
                        <button
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                          onClick={() => handleFriendAction(item.requestId, 'reject')}
                          aria-label={`Từ chối lời mời kết bạn từ ${item.user?.firstName} ${item.user?.lastName}`}
                        >
                          Từ chối
                        </button>
                      </div>
                    )}

                    {/* Nút cho tab danh sách bạn bè */}
                    {activeTab === 'friends' && (
                      <button
                        className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                        onClick={() => handleFriendAction(item.id, 'unfriend')}
                        aria-label={`Hủy kết bạn với ${item.firstName} ${item.lastName}`}
                      >
                        Hủy kết bạn
                      </button>
                    )}

                    {/* Nút cho tab gợi ý bạn bè */}
                    {activeTab === 'suggestions' && (
                      <button
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        onClick={() => handleFriendAction(item.id, 'add')}
                        aria-label={`Kết bạn với ${item.firstName} ${item.lastName}`}
                      >
                        Kết bạn
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8 gap-4">
            <button
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Trang trước"
            >
              &lt;
            </button>
            <span className="text-gray-600">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Trang sau"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Friends;
