import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  BarChart3,
  MessageSquare,
  Menu,
  X,
  LogOut,
  Home,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import avatar from "../../assets/logo_skillup.png";
function LecturerSidebar({ isOpen, onToggle, isPending = false }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const NavItem = ({ icon: Icon, label, path, badge, disabled = false }) => {
    const content = (
      <>
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!isCollapsed && (
          <>
            <span className="flex-1">{label}</span>
            {badge && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {badge}
              </span>
            )}
          </>
        )}
      </>
    );

    if (disabled) {
      return (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-not-allowed opacity-50 ${isCollapsed ? "justify-center" : ""
            }`}
          title={isCollapsed ? label : "Chỉ khả dụng sau khi CV được duyệt"}
        >
          {content}
        </div>
      );
    }

    return (
      <Link
        to={path}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(path)
            ? "bg-yellow-100 text-yellow-700 font-semibold"
            : "text-gray-700 hover:bg-gray-100"
          } ${isCollapsed ? "justify-center" : ""}`}
        title={isCollapsed ? label : ""}
      >
        {content}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50 flex flex-col ${
          isOpen ? "w-64" : "w-0 md:w-0"
        } ${isCollapsed ? "md:w-20" : "md:w-64"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
          {!isCollapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                  <img src={avatar} alt="SkillUp" />
                </div>
                <span className="font-bold text-gray-900">SkillUp</span>
              </div>
            </Link>
          )}
          <button
            onClick={onToggle}
            className="md:hidden p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block p-1 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - This will grow to fill available space */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
          {/* Main Section */}
          <div className={`px-2 ${isCollapsed ? "text-center" : ""}`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {!isCollapsed && "Menu"}
            </p>
          </div>

          <NavItem
            icon={Home}
            label="Bảng điều khiển"
            path="/lecturer/dashboard"
            disabled={isPending}
          />

          <div className={`px-2 mt-6 ${isCollapsed ? "text-center" : ""}`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {!isCollapsed && "Giảng dạy"}
            </p>
          </div>

          <NavItem
            icon={BookOpen}
            label="Khóa học"
            path="/lecturer/courses"
            disabled={isPending}
          />

          <NavItem
            icon={Users}
            label="Học viên"
            path="/lecturer/students"
            disabled={isPending}
          />

          <NavItem
            icon={BarChart3}
            label="Ngân hàng đề"
            path="/lecturer/question-bank"
            disabled={isPending}
          />

          <NavItem
            icon={MessageSquare}
            label="Phiếu hỗ trợ"
            path="/lecturer/ticket"
            disabled={isPending}
          />
        </nav>

        {/* Footer - Logout - This stays at the bottom */}
        <div className="border-t p-3 flex-shrink-0">
          <button
            onClick={() => {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200 ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? "Đăng xuất" : ""}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default LecturerSidebar;
