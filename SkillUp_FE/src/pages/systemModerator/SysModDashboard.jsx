// src/pages/systemmod/SystemModeratorDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  AcademicCapIcon,
  ShieldExclamationIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { Spin } from "antd";
import { modDashboardAPI } from "@/api/modDashboardAPI";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/ui/card";
import { SupportSection } from "@/components/Dashboard/systemmod/SupportSection";
import { SystemCharts } from "@/components/Dashboard/systemmod/SystemCharts";

export default function SystemModeratorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await modDashboardAPI.getSystemModDashboard();

      if (response.code === 200 && response.data && response.data.length > 0) {
        setDashboardData(response.data[0]);
      } else {
        toast.error("Không thể tải dữ liệu dashboard");
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Lỗi khi tải dashboard");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, bg, border, onClick }) => (
    <Card
      onClick={onClick}
      className={`rounded-2xl shadow-xl transition-transform duration-200 hover:scale-[1.025] ${bg} ${border} ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold mb-1.5 opacity-75">{title}</p>
            <p className="text-2xl font-bold mb-1">{value}</p>
          </div>
          <div className="p-3 rounded-full bg-white shadow-md ring-2 ring-offset-2 ring-blue-300 flex items-center justify-center">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Không có dữ liệu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
      </div>

      {/* Priority Actions Alert */}
      {(dashboardData.pendingTicketCount > 30 ||
        dashboardData.pendingLecturerApplicationCount > 15) && (
        <div className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4 text-white">
            <BellAlertIcon className="w-7 h-7" />
            <div>
              <p className="text-xl font-bold">Cần xử lý ngay</p>
              <p className="text-white/90 text-sm">
                Có nhiều yêu cầu đang chờ xử lý
              </p>
            </div>
          </div>
        </div>
      )}

      {/* User Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Giảng viên</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Đang hoạt động"
            value={dashboardData.activeLecturerCount}
            icon={AcademicCapIcon}
            bg="bg-gradient-to-br from-green-50 to-green-100"
            border="border-l-4 border-l-green-400"
            onClick={() => navigate("/sysmod/manage-user")}
          />
          <StatCard
            title="Không hoạt động"
            value={dashboardData.inactiveLecturerCount}
            icon={AcademicCapIcon}
            bg="bg-gradient-to-br from-gray-50 to-gray-100"
            border="border-l-4 border-l-gray-400"
            onClick={() => navigate("/sysmod/manage-user")}
          />
          <StatCard
            title="Bị cấm"
            value={dashboardData.bannedLecturerCount}
            icon={ShieldExclamationIcon}
            bg="bg-gradient-to-br from-red-50 to-red-100"
            border="border-l-4 border-l-red-400"
            onClick={() => navigate("/sysmod/manage-user")}
          />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Học viên</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Đang hoạt động"
            value={dashboardData.activeStudentCount}
            icon={UserIcon}
            bg="bg-gradient-to-br from-blue-50 to-blue-100"
            border="border-l-4 border-l-blue-400"
            onClick={() => navigate("/sysmod/manage-user")}
          />
          <StatCard
            title="Không hoạt động"
            value={dashboardData.inactiveStudentCount}
            icon={UserIcon}
            bg="bg-gradient-to-br from-gray-50 to-gray-100"
            border="border-l-4 border-l-gray-400"
            onClick={() => navigate("/sysmod/manage-user")}
          />
          <StatCard
            title="Bị cấm"
            value={dashboardData.bannedStudentCount}
            icon={ShieldExclamationIcon}
            bg="bg-gradient-to-br from-red-50 to-red-100"
            border="border-l-4 border-l-red-400"
            onClick={() => navigate("/sysmod/manage-user")}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Thống kê</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SystemCharts dashboardData={dashboardData} />
        </div>
      </div>

      {/* Support Section */}
      <SupportSection dashboardData={dashboardData} navigate={navigate} />
    </div>
  );
}
