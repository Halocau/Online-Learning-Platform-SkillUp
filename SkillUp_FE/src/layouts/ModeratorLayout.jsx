import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { FileText, MessageSquare, LogOut, Menu, X, Layout, LayoutDashboard } from "lucide-react";
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
    { label: "Dashboard", icon: <LayoutDashboard />, path: "/mod/" },
    { label: "Manage News", icon: <FileText />, path: "/mod/news" },
    { label: "Tickets Request", icon: <MessageSquare />, path: "/mod/tickets" },
    { label: "Comment Reports", icon: <MessageSquare />, path: "/mod/cmt" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`${
          collapsed ? "w-16" : "w-60"
        } bg-white border-r flex flex-col transition-all duration-300`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b">
          <span className="text-xl font-bold text-indigo-600">
            {collapsed ? "SU" : "SkillUp Mod"}
          </span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-600 hover:text-gray-900 md:hidden"
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
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
