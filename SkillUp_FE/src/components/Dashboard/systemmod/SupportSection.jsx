// src/components/systemmod/SupportSection.jsx
import React from "react";
import {
  TicketIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

export const SupportSection = ({ dashboardData, navigate }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tickets */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <TicketIcon className="w-5 h-5 text-amber-600" strokeWidth={2} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Hỗ trợ</h2>
        </div>
        <div className="space-y-4">
          <div
            onClick={() => navigate("/sysmod/ticket")}
            className="flex items-center justify-between p-4 bg-amber-50/50 rounded-2xl border border-amber-100 hover:border-amber-200 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ClockIcon className="w-6 h-6 text-amber-600" strokeWidth={2} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Chờ xử lý</p>
                <p className="text-xs text-gray-500">Cần phản hồi nhanh</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-amber-600">{dashboardData.pendingTicketCount}</p>
          </div>
          <div
            onClick={() => navigate("/sysmod/ticket")}
            className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CheckCircleIcon className="w-6 h-6 text-emerald-600" strokeWidth={2} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Đã giải quyết</p>
                <p className="text-xs text-gray-500">Hoàn thành tốt</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{dashboardData.solvedTicketCount}</p>
          </div>
        </div>
      </div>

      {/* Applications */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <AcademicCapIcon className="w-5 h-5 text-purple-600" strokeWidth={2} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Đơn đăng ký</h2>
        </div>
        <div className="space-y-4">
          <div
            onClick={() => navigate("/sysmod/lecturer-application")}
            className="flex items-center justify-between p-4 bg-orange-50/50 rounded-2xl border border-orange-100 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ClockIcon className="w-6 h-6 text-orange-600" strokeWidth={2} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Chờ duyệt</p>
                <p className="text-xs text-gray-500">Cần xem xét</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {dashboardData.pendingLecturerApplicationCount}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => navigate("/sysmod/lecturer-application")}
              className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 hover:border-emerald-200 text-center hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600" strokeWidth={2} />
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                {dashboardData.lecturerApplicationAcceptedCount}
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Đã chấp nhận</p>
            </div>
            <div
              onClick={() => navigate("/sysmod/lecturer-application")}
              className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 hover:border-rose-200 text-center hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                <XCircleIcon className="w-5 h-5 text-rose-600" strokeWidth={2} />
              </div>
              <p className="text-2xl font-bold text-rose-600">
                {dashboardData.lecturerApplicationRejectedCount}
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Bị từ chối</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};