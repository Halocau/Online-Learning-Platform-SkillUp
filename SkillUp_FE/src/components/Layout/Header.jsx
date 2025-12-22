import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance, API_ENDPOINTS } from "@/config/api";
import { toast } from "react-toastify";
import { useCart } from "@/context/CartContext";
import { clearGuestCart } from "@/utils/guestCart";
import SearchEngine from "@/components/common/SearchEngine";
import NotificationBell from "@/components/common/NotificationBell";
import avatar from "../../assets/logo_skillup.png";
import { ShoppingCart } from "lucide-react";

function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(() => {
    const cachedUser = localStorage.getItem("user");
    return cachedUser ? JSON.parse(cachedUser) : null;
  });
  const navigate = useNavigate();
  const { cartCount, fetchCartCount } = useCart();
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

        if (res.data.code === 200) {
          const userData = res.data.data[0];
          setUser((prev) => {
            const updatedUser = {
              ...(prev || {}),
              fullname: userData.fullName,
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            return updatedUser;
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();

    const handleStorageChange = () => {
      const cachedUser = localStorage.getItem("user");
      if (cachedUser && cachedUser !== "null") {
        setUser(JSON.parse(cachedUser));
      } else {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [accessToken]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post(API_ENDPOINTS.LOGOUT);
    } catch {
      // Ignore error
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      clearGuestCart();
      setUser(null);
      setShowDropdown(false);
      // Reset cart count về 0
      await fetchCartCount();
      toast.success("Đăng xuất thành công!");
      navigate("/");
    }
  };

  return (
    <header className="border-b border-[#272343]/15 bg-[#fffffe]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="flex h-18 w-18 items-center justify-center rounded-lg bg-[#e3f6f5] ring-1 ring-[#272343]/10">
            <span className="text-xs font-semibold tracking-tight text-[#272343]">
              <img src={avatar} alt="SkillUp" />
            </span>
          </div>
          {/* <div className="hidden sm:block">
            <span className="text-lg font-semibold tracking-tight text-[#272343]">
              SkillUp
            </span>
          </div> */}
        </Link>

        {/* Search Bar */}
        <SearchEngine />

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            to="/"
            className="text-[#2d334a] hover:text-[#272343] hover:bg-[#e3f6f5] font-medium px-3 py-1.5 rounded-full transition-all text-sm tracking-tight"
          >
            Trang chủ
          </Link>
          <Link
            to="/forum"
            className="text-[#2d334a] hover:text-[#272343] hover:bg-[#e3f6f5] font-medium px-3 py-1.5 rounded-full transition-all text-sm tracking-tight"
          >
            Diễn đàn
          </Link>
          {isAuthenticated && (
            <Link
              to="/ticket"
              className="text-[#2d334a] hover:text-[#272343] hover:bg-[#e3f6f5] font-medium px-0.5 py-1.5 rounded-full transition-all text-sm tracking-tight"
            >
              Phiếu hỗ trợ
            </Link>
          )}
        </nav>

        {/* Right Menu */}
        <div className="flex items-center space-x-3 sm:space-x-3 flex-shrink-0">
          {/* News Link */}
          <Link
            to="/news"
            className="text-[#2d334a] hover:text-[#272343] hover:bg-[#e3f6f5] font-medium px-3 py-1.5 rounded-full transition-all text-sm tracking-tight"
          >
            Tin tức
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="text-[#2d334a] hover:text-[#272343] transition-colors p-2 relative"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FFD54F] text-[#272343] text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <div className="relative flex items-center space-x-3">
              {/* Notification Bell */}
              <NotificationBell />

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
                <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer ">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-[#e3f6f5] to-[#bae8e8] rounded-full flex items-center justify-center overflow-hidden ring-2 ring-[#272343]/10">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user?.fullname || "User"}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-[#272343] font-semibold text-sm">
                        {user?.fullname?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#fffffe] rounded-2xl shadow-[0_18px_60px_rgba(39,35,67,0.18)] border border-[#272343]/15 py-2 z-50 transition-all duration-200">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-[#2d334a] hover:bg-[#e3f6f5] hover:text-[#272343] font-medium tracking-tight"
                      >
                        Hồ sơ của tôi
                      </Link>
                      <Link
                        to="/my-courses"
                        className="block px-4 py-2 text-sm text-[#2d334a] hover:bg-[#e3f6f5] hover:text-[#272343] font-medium tracking-tight"
                      >
                        Khóa học của tôi
                      </Link>
                      <Link
                        to="/purchase-history"
                        className="block px-4 py-2 text-sm text-[#2d334a] hover:bg-[#e3f6f5] hover:text-[#272343] font-medium tracking-tight"
                      >
                        Lịch sử mua hàng
                      </Link>
                    </div>

                    <div className="border-t border-[#272343]/15 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium tracking-tight"
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
                className="text-[#272343] hover:text-[#272343] font-medium transition-colors border border-[#272343]/15 px-3 py-1.5 rounded-full hover:bg-[#e3f6f5] text-sm tracking-tight"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-[#FFD54F] text-[#272343] px-4 py-1.5 rounded-full hover:bg-[#F4C430] transition-colors font-semibold text-sm tracking-tight shadow-sm"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
