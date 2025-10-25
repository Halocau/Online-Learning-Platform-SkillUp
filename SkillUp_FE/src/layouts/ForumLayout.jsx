// src/pages/forum/ForumLayout.jsx
import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Button } from "antd";

export default function ForumLayout() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Forum</h1>
          
        </div>

        <div className="grid grid-cols-12 gap-6">
          
          <aside className="col-span-3 bg-white p-4 rounded shadow-sm">
            <div className="mb-6">
              <input
                placeholder="Search"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <nav className="space-y-3 text-sm text-gray-700">
              <Link to="/forum" className="block">Posts</Link>
              <a className="block">Tags</a>
              <a className="block">Ranking</a>

              <div className="mt-6 text-xs text-gray-400">PERSONAL NAVIGATOR</div>
              <Link to="/forum" className="block">Your posts</Link>
              <a className="block">Your answers</a>
              <a className="block">Your likes & votes</a>
            </nav>
          </aside>

          
          <main className="col-span-7">
            <Outlet />
          </main>

         
          <aside className="col-span-2">
            <div className="bg-white p-4 rounded shadow-sm mb-4">
              <h3 className="font-semibold mb-2">Must-read posts</h3>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Please read rules before you start working on a platform</li>
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
          </aside>
        </div>
      </div>
    </div>
  );
}
