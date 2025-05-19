import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import NotificationDropdown from "./Notification/NotificationDropdown";
import { useUser } from "../contexts/UserContext";
import { API_ENDPOINTS } from "../config/api";
import { useToast } from "../context/ToastContext";
import { Search, House, TvMinimalPlay, Store, Gamepad, ChevronDown } from "lucide-react";

/**
 * Component header chính của ứng dụng
 * Hiển thị logo, thanh tìm kiếm, thông báo và thông tin người dùng
 */
function Header() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const [searchQuery, setSearchQuery] = useState("");
  const { showError } = useToast();

  /**
   * Cập nhật lại avatar khi thông tin người dùng thay đổi
   */
  useEffect(() => {
    if (currentUser) {
      // Cập nhật key để buộc render lại avatar
      setAvatarKey(Date.now());
    }
  }, [currentUser]);

  /**
   * Xử lý đăng xuất
   * Xóa thông tin đăng nhập và chuyển hướng về trang đăng nhập
   */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /**
   * Xử lý tìm kiếm
   * @param {Event} e - Sự kiện submit form
   */
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      showError("Vui lòng nhập từ khóa tìm kiếm");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="block fixed top-0 right-0 left-0 bg-white z-[9999] border-y border-gray-200">
      <div className="flex flex-col justify-center h-[56px] relative">
        <div className="flex items-center justify-between">
          {/* Phần trái: Logo và ô tìm kiếm */}
          <div className="flex items-center box-border p-4 w-[360px] gap-3">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <svg viewBox="0 0 36 36" width="40" height="40">
                <path d="M20.181 35.87C29.094 34.791 36 27.202 36 18c0-9.941-8.059-18-18-18S0 8.059 0 18c0 8.442 5.811 15.526 13.652 17.471L14 34h5.5l.681 1.87Z" fill="blue"></path>
                <path d="M13.651 35.471v-11.97H9.936V18h3.715v-2.37c0-6.127 2.772-8.964 8.784-8.964 1.138 0 3.103.223 3.91.446v4.983c-.425-.043-1.167-.065-2.081-.065-2.952 0-4.09 1.116-4.09 4.025V18h5.883l-1.008 5.5h-4.867v12.37a18.183 18.183 0 0 1-6.53-.399Z" fill="white"></path>
              </svg>
            </Link>
            <form onSubmit={handleSearch} className="flex-1">
              <label className="input bg-base-100 rounded-3xl w-full border-none !outline-none flex items-center gap-2">
                <Search className="size-5" />
                <input
                  type="search"
                  className="font-[Segoe UI Historic] text-[15px] w-full bg-transparent"
                  placeholder="Tìm kiếm trên FaceBook"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </label>
            </form>
          </div>

          {/* Phần giữa: Menu chính */}
          <div className="flex items-center gap-[8px]">
            <div className="box-border p-1 w-[111px] h-[56px]">
              <button className="btn btn-ghost size-full rounded-lg hover:bg-gray-700">
                <Link to="/">
                  <House size={25} />
                </Link>
              </button>
            </div>
            <div className="box-border p-1 w-[111px] h-[56px]">
              <button className="btn btn-ghost size-full rounded-lg hover:bg-gray-700">
                <Link to="/">
                  <TvMinimalPlay size={25} />
                </Link>
              </button>
            </div>
            <div className="box-border p-1 w-[111px] h-[56px]">
              <button className="btn btn-ghost size-full rounded-lg hover:bg-gray-700">
                <Link to="/">
                  <Store size={25} />
                </Link>
              </button>
            </div>
            <div className="box-border p-1 w-[111px] h-[56px]">
              <button className="btn btn-ghost size-full rounded-lg hover:bg-gray-700">
                <Link to="/">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M12 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-2 4a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"></path>
                    <path d="M12 .5C5.649.5.5 5.649.5 12S5.649 23.5 12 23.5 23.5 18.351 23.5 12 18.351.5 12 .5zM2.5 12c0-.682.072-1.348.209-1.99a2 2 0 0 1 0 3.98A9.539 9.539 0 0 1 2.5 12zm4 0a4.001 4.001 0 0 0-3.16-3.912A9.502 9.502 0 0 1 12 2.5a9.502 9.502 0 0 1 8.66 5.588 4.001 4.001 0 0 0 0 7.824 9.514 9.514 0 0 1-1.755 2.613A5.002 5.002 0 0 0 14 14.5h-4a5.002 5.002 0 0 0-4.905 4.025 9.515 9.515 0 0 1-1.755-2.613A4.001 4.001 0 0 0 6.5 12zm13 0a2 2 0 0 1 1.791-1.99 9.538 9.538 0 0 1 0 3.98A2 2 0 0 1 19.5 12zm-2.51 8.086A9.455 9.455 0 0 1 12 21.5c-1.83 0-3.54-.517-4.99-1.414a1.004 1.004 0 0 1-.01-.148V19.5a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v.438a1 1 0 0 1-.01.148z"></path>
                  </svg>
                </Link>
              </button>
            </div>
            <div className="box-border p-1 w-[111px] h-[56px]">
              <button className="btn btn-ghost size-full rounded-lg hover:bg-gray-700">
                <Link to="/">
                  <Gamepad size={25} />
                </Link>
              </button>
            </div>
          </div>

          {/* Phần phải: Thông tin người dùng và các biểu tượng */}
          <div className="flex justify-end items-center box-border p-4 w-[360px] gap-1">
            {/* Thông báo */}
            {currentUser && <NotificationDropdown currentUser={currentUser} />}

            {/* Avatar người dùng */}
            {currentUser && (
              <Link
                to="/profile"
                className="flex items-center gap-2 no-underline"
                aria-label="Xem hồ sơ cá nhân"
              >
                <img
                  src={currentUser.avatar
                    ? (currentUser.avatar.startsWith('blob:')
                        ? currentUser.avatar
                        : `${API_ENDPOINTS.BASE_URL}${currentUser.avatar}?t=${avatarKey}`)
                    : '/default-imgs/avatar.png'}
                  alt={`Ảnh đại diện của ${currentUser.firstName} ${currentUser.lastName}`}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-imgs/avatar.png';
                  }}
                  key={`header-avatar-${currentUser.id}-${avatarKey}`}
                />
              </Link>
            )}

            {/* Nút đăng xuất */}
            <button
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={handleLogout}
              title="Đăng xuất"
              aria-label="Đăng xuất khỏi tài khoản"
            >
              <img
                src="/img/logout.png"
                alt="Biểu tượng đăng xuất"
                className="w-9 h-9"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
