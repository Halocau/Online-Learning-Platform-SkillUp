// src/components/contentmoderator/PriorityAlert.jsx
import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export const PriorityAlert = ({ count, onClick }) => {
  if (count <= 0) return null;

  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-r from-rose-500/95 to-orange-500/95 rounded-3xl p-6 shadow-md cursor-pointer hover:shadow-lg transition-all group"
    >
      <div className="flex items-center justify-between flex-wrap gap-4 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ExclamationTriangleIcon className="w-7 h-7" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xl font-bold">{count} báo cáo chưa xử lý</p>
            <p className="text-white/90 text-sm">Cần kiểm duyệt và xử lý ngay</p>
          </div>
        </div>
        <button className="bg-white text-rose-600 px-5 py-2. 5 rounded-2xl font-semibold hover:bg-rose-50 transition-colors duration-300 text-sm">
          Xem ngay →
        </button>
      </div>
    </div>
  );
};