// src/pages/forum/ForumLayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation, NavLink } from "react-router-dom";
import { Button, Drawer, Select, Input } from "antd";
import { Menu, X } from "lucide-react";
import { categoryApi } from "@/api/forumCategory";

const { Option } = Select;
export default function ForumLayout() {
  const [userId, setUserId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCat, setFilterCat] = useState(null);
  const [filterDate, setFilterDate] = useState("newest");
  const [categories, setCategories] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const id = payload?.userId;
        if (id) {
          setUserId(id);
          localStorage.setItem("userId", id);
        }
      } catch (err) {
        console.error("Token decode failed:", err);
        setUserId(null);
        localStorage.removeItem("userId");
      }
    } else {
      localStorage.removeItem("userId");
      setUserId(null);
    }
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location]);

  useEffect(() => {
    (async () => {
      try {
        const res = await categoryApi.getAll();
        const data = res?.data?.data ?? res?.data ?? [];
        setCategories(
          (data || []).filter((c) => c.IsActive ?? c.isActive ?? true)
        );
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    })();
  }, []);

  const outletContext = {
    searchTerm,
    setSearchTerm,
    filterCat,
    setFilterCat,
    filterDate,
    setFilterDate,
    categories,
    setCategories,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {/* Mobile: toggle sidebar */}
          <div className="flex items-center gap-3 md:hidden">
            <Button
              onClick={() => setDrawerOpen(true)}
              className="bg-[#FFD54F] border-0 text-gray-800 hover:opacity-95 rounded-lg"
            >
              <Menu size={20} />
            </Button>
            <Link to="/forum/create" className="hidden sm:inline-block">
              <Button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-all shadow-md hover:shadow-lg">
                Tạo bài viết
              </Button>
            </Link>
          </div>
        </div>

        {/* Layout wrapper */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - desktop visible */}
          <aside className="hidden md:block col-span-3">
            <div className="sticky top-24 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-5">
              {/* Search */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">
                  Tìm kiếm
                </label>
                <Input
                  placeholder="Tìm tiêu đề..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                  className="rounded-lg"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-gray-700 pt-2 border-t border-gray-100 font-medium">
                  Danh mục
                </label>
                <Select
                  placeholder="Chọn danh mục"
                  allowClear
                  value={filterCat ?? undefined}
                  onChange={(v) => setFilterCat(v || null)}
                  className="w-full rounded-lg"
                >
                  {categories.map((c) => (
                    <Option
                      key={c._id ?? c.id ?? c.Id}
                      value={c.name ?? c.Name}
                    >
                      {c.name ?? c.Name}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-gray-700 pt-2 border-t border-gray-100 font-medium">
                  Sắp xếp
                </label>
                <Select
                  value={filterDate}
                  onChange={(v) => setFilterDate(v)}
                  className="w-full rounded-lg"
                >
                  <Option value="newest">Mới nhất</Option>
                  <Option value="oldest">Cũ nhất</Option>
                </Select>
              </div>

              {/* Quick Links */}
              <nav className="space-y-3 text-base text-gray-700 pt-3 border-t border-gray-100 font-medium">
                <NavLink
                  to="/forum"
                  end
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-[#FFD54F] text-gray-900 font-semibold shadow-sm"
                        : "hover:bg-[#FFF3C4] hover:text-gray-900"
                    }`
                  }
                >
                  Bài đăng
                </NavLink>

                <NavLink
                  to={userId ? `/forum/user/${userId}` : "/forum"}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-[#FFD54F] text-gray-900 font-semibold shadow-sm"
                        : "hover:bg-[#FFF3C4] hover:text-gray-900"
                    }`
                  }
                >
                  Bài đăng của tôi
                </NavLink>
              </nav>
            </div>
          </aside>

          <main className="col-span-12 md:col-span-7">
            <Outlet context={outletContext} />
          </main>

          <aside className="hidden lg:block col-span-2">
            <div className="sticky top-24 space-y-4">
              {/* Section 1: Must-read posts (Thông Tin Cốt Lõi) */}
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <h3 className="font-semibold mb-2">Thông Tin Cốt Lõi</h3>{" "}
                {/* Core Information */}
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>
                    • Vui lòng đọc quy tắc trước khi bạn bắt đầu làm việc trên
                    nền tảng
                  </li>
                  <li>• Tầm nhìn & Chiến lược của SkillUp</li>
                </ul>
              </div>

              {/* Section 2: Featured links (Đường Dẫn Nhanh) */}
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <h3 className="font-semibold mb-2">Đường Dẫn Nhanh</h3>{" "}
                {/* Quick Paths/Links */}
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Tài liệu SkillUp</li>
                  <li>• Cộng đồng</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
