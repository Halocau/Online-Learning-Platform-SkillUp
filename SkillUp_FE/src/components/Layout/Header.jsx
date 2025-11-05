import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo_skillup.png";
import { axiosInstance, API_ENDPOINTS } from "@/config/api";
import { toast } from "react-toastify";
import { useCart } from "@/context/CartContext";
function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(() => {
    const cachedUser = localStorage.getItem("user");
    return cachedUser ? JSON.parse(cachedUser) : null;
  });
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const accessToken = localStorage.getItem("accessToken");
  const isAuthenticated = !!accessToken;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!accessToken) return;

        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        }

        const res = await axiosInstance.get("/User/View-Profile");
        const userData = res.data.data[0];

        const updatedUser = {
          ...userData,
          role:
            userData.role || JSON.parse(cachedUser || "{}").role || "Student",
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (err) {
        console.error("Không thể lấy thông tin người dùng:", err);
      }
    };

    fetchProfile();
  }, [accessToken]);
  null;

  const handleLogout = async () => {
    try {
      // Gọi API logout để revoke RefreshToken
      // Backend lấy userId từ JWT token qua [Authorize]
      await axiosInstance.post(API_ENDPOINTS.LOGOUT);
    } catch {
      // Ignore error
    } finally {
      // Xóa token ở client
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      setShowDropdown(false);
      toast.success("Đăng xuất thành công!");
      navigate("/");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <img src={logo} alt="SkillUp Logo" className="h-8 w-auto" />
          </Link>

          {/* Search Bar - Responsive */}
          <div className="flex-1 max-w-2xl mx-2 sm:mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm khóa học..."
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 text-sm sm:text-base"
              />
              <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </form>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              className="text-gray-700 hover:text-[#FFD54F] font-medium px-4 py-2 transition-colors text-sm"
            >
              Trang chủ
            </Link>
            <Link
              to="/forum"
              className="text-gray-700 hover:text-[#FFD54F] font-medium px-4 py-2 transition-colors text-sm"
            >
              Diễn đàn
            </Link>
            {isAuthenticated && user?.role === "Student" && (
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-[#FFD54F] font-medium px-4 py-2 transition-colors text-sm"
              >
                Dashboard
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/ticket"
                className="text-gray-700 hover:text-[#FFD54F] font-medium px-4 py-2 transition-colors text-sm"
              >
                Phiếu hỗ trợ
              </Link>
            )}
          </nav>

          {/* Right Menu - Responsive */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* Business Link - Hidden on small screens */}
            <Link
              to="/news"
              className="hidden md:block text-gray-700 hover:text-[#FFD54F] font-medium transition-colors text-sm"
            >
              Tin tức
            </Link>

            {/* Teach Link - Hidden on mobile */}
            <Link
              to="/teach"
              className="hidden lg:block text-gray-700 hover:text-[#FFD500] font-medium transition-colors text-sm"
            ></Link>

            
            {/* Cart */}
            <Link
              to={isAuthenticated && user ? `/cart/${user.id}` : "/login"}
              onClick={(e) => {
                if (!isAuthenticated || !user) {
                  e.preventDefault();
                  toast.info("Vui lòng đăng nhập để xem giỏ hàng");
                  navigate("/login");
                }
              }}
              className="text-gray-700 hover:text-[#FFD54F] transition-colors p-2 relative"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 8M7 13l2.5 8M13 13v8"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative flex items-center space-x-3">
                {/* Notification Bell */}
                <button className="text-gray-700 hover:text-[#FFD54F] transition-colors p-2 relative">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </button>

                {/* User Avatar with Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => {
                    if (window.dropdownHideTimeout)
                      clearTimeout(window.dropdownHideTimeout);
                    setShowDropdown(true);
                  }}
                  onMouseLeave={() => {
                    window.dropdownHideTimeout = setTimeout(() => {
                      setShowDropdown(false);
                    }, 80);
                  }}
                >
                  <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.fullname}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-sm sm:text-base">
                          {user?.fullname?.charAt(0).toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 transition-all duration-200">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Hồ sơ của tôi
                        </Link>
                        <Link
                          to="/my-courses"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Khóa học của tôi
                        </Link>
                      </div>

                      <div className="border-t border-gray-200 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-[#FFD500] font-medium transition-colors border border-gray-900 px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-gray-50 text-sm"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-900 text-white px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
