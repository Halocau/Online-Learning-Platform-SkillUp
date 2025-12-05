// src/components/systemmod/UserStats.jsx
import React from "react";
import { AcademicCapIcon, UserGroupIcon, UserIcon, ShieldExclamationIcon } from "@heroicons/react/24/outline";
import { StatCard } from "../StatCard";


export const UserStats = ({ dashboardData, navigate }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Lecturer Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <AcademicCapIcon className="w-5 h-5 text-emerald-600" strokeWidth={2} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Giảng viên</h2>
        </div>
        <div className="space-y-4">
          <StatCard
            title="Đang hoạt động"
            value={dashboardData.activeLecturerCount}
            icon={AcademicCapIcon}
            color="green"
            onClick={() => navigate("/sysmod/manage-user")}
          />
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Không hoạt động"
              value={dashboardData.inactiveLecturerCount}
              icon={AcademicCapIcon}
              color="gray"
              onClick={() => navigate("/sysmod/manage-user")}
            />
            <StatCard
              title="Bị cấm"
              value={dashboardData.bannedLecturerCount}
              icon={ShieldExclamationIcon}
              color="red"
              onClick={() => navigate("/sysmod/manage-user")}
            />
          </div>
        </div>
      </div>

      {/* Student Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <UserGroupIcon className="w-5 h-5 text-blue-600" strokeWidth={2} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Học viên</h2>
        </div>
        <div className="space-y-4">
          <StatCard
            title="Đang hoạt động"
            value={dashboardData.activeStudentCount}
            icon={UserIcon}
            color="blue"
            onClick={() => navigate("/sysmod/manage-user")}
          />
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Không hoạt động"
              value={dashboardData.inactiveStudentCount}
              icon={UserIcon}
              color="gray"
              onClick={() => navigate("/sysmod/manage-user")}
            />
            <StatCard
              title="Bị cấm"
              value={dashboardData.bannedStudentCount}
              icon={ShieldExclamationIcon}
              color="red"
              onClick={() => navigate("/sysmod/manage-user")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};