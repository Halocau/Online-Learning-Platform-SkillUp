// src/pages/forum/ForumLayout.jsx
import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useEffect, useState } from "react";
export default function ForumLayout() {
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    setUserId(storedId);
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Diễn đàn</h1>
        </div>

        {/* Layout wrapper - must NOT have overflow hidden */}
        <div className="grid grid-cols-12 gap-6">
          {/* ✅ Left sidebar */}
          <aside className="col-span-3">
            <div className="sticky top-24 bg-white p-4 rounded shadow-sm space-y-4">
              <div>
                <input
                  placeholder="Search"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <nav className="space-y-3 text-sm text-gray-700">
                <Link
                  to="/forum"
                  className="block hover:text-indigo-600 transition-colors"
                >
                  Bài đăng
                </Link>
                <a className="block hover:text-indigo-600 transition-colors">
                  Tags
                </a>
                <a className="block hover:text-indigo-600 transition-colors">
                  Xếp hạng
                </a>

                <div className="mt-6 text-xs text-gray-400 uppercase">
                  Personal Navigator
                </div>
                <Link
                  to={userId ? `/forum/user/${userId}` : "/forum"}
                  className="block hover:text-indigo-600 transition-colors"
                >
                  Bài đăng của tôi
                </Link>
                <a className="block hover:text-indigo-600 transition-colors">
                  Bài đã lưu
                </a>
                <a className="block hover:text-indigo-600 transition-colors">
                  Đã thích
                </a>
              </nav>
            </div>
          </aside>

          <main className="col-span-7">
            <Outlet />
          </main>

          <aside className="col-span-2">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white p-4 rounded shadow-sm">
                <h3 className="font-semibold mb-2">Must-read posts</h3>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>
                    • Please read rules before you start working on a platform
                  </li>
                  <li>• Vision & Strategy of SkillUp</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded shadow-sm">
                <h3 className="font-semibold mb-2">Featured links</h3>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• SkillUp docs</li>
                  <li>• Community</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
