import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FileText,
  MessageSquare,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ModeratorLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { label: "Bảng điều khiển", icon: <LayoutDashboard size={18} />, path: "/contentmod" },
    { label: "Quản lý tin tức", icon: <FileText size={18} />, path: "/contentmod/news" },
    { label: "Quản lý khóa học", icon: <BookOpen size={18} />, path: "/contentmod/course" },
    { label: "Quản lý bài đăng", icon: <FileText size={18} />, path: "/contentmod/post" },
    { label: "Báo cáo bình luận", icon: <MessageSquare size={18} />, path: "/contentmod/rpcmt" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-60"} bg-white border-r flex flex-col transition-all duration-300`}>
        <div className="flex items-center justify-between px-4 h-16 border-b">
          <span className="text-xl font-bold text-indigo-600">
            {collapsed ? "SU" : "SkillUp ContentMod"}
          </span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-600 hover:text-gray-900 md:hidden"
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive
                  ? "bg-indigo-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`
              }
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-3">
          <Button
            variant="ghost"
            className="w-full flex items-center gap-2 justify-center text-gray-700 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
