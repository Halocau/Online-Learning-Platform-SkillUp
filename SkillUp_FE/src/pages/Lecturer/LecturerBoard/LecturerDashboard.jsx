// src/pages/lecturer/LecturerDashboard.jsx
import { useState, useEffect } from "react";
import { BarChart3, Users, DollarSign, BookOpen, DollarSign as DollarSignIcon } from "lucide-react";
import { lecturerDashboardAPI } from "@/api/lecturerDashboardAPI";
import { toast } from "react-toastify";
import { LecturerStatCard } from "@/components/Dashboard/lecturer/LecturerStatCard";
import { CoursesList } from "@/components/Dashboard/lecturer/CourseList";
import RevenueDashboard from "./RevenueDashboard";


function LecturerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === "overview") {
      loadDashboardData();
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await lecturerDashboardAPI.getViewDashboard();

      if (response.data. code === 200) {
        setDashboardData(response.data.data[0]);
      } else {
        toast.error("Không thể tải dữ liệu dashboard");
      }
    } catch (error) {
      toast. error("Lỗi khi tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
      </div>

      {/* Tabs */}
      <div className="mb-7 border-b border-yellow-200">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-semibold text-md transition-all relative rounded-t-xl ${
              activeTab === "overview"
                ? "text-yellow-700 bg-gradient-to-b from-yellow-50 to-white border-b-2 border-yellow-500 shadow-sm"
                : "text-gray-700 hover:bg-yellow-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tổng quan
            </div>
          </button>
          <button
            onClick={() => setActiveTab("revenue")}
            className={`px-6 py-3 font-semibold text-md transition-all relative rounded-t-xl ${
              activeTab === "revenue"
                ? "text-yellow-700 bg-gradient-to-b from-yellow-50 to-white border-b-2 border-yellow-500 shadow-sm"
                : "text-gray-700 hover:bg-yellow-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <DollarSignIcon className="w-5 h-5" />
              Doanh thu
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <LecturerStatCard
                  icon={BookOpen}
                  label="Khóa học"
                  value={dashboardData?.totalCourses || 0}
                  bg="bg-gradient-to-br from-blue-50 to-blue-100"
                  border="border-l-4 border-l-blue-400"
                  description="Tổng số khóa học bạn đã tạo"
                />
                <LecturerStatCard
                  icon={Users}
                  label="Học viên"
                  value={dashboardData?.totalStudents || 0}
                  bg="bg-gradient-to-br from-green-50 to-green-100"
                  border="border-l-4 border-l-green-400"
                  description="Tổng học viên đăng ký các khoá bạn dạy"
                />
                <LecturerStatCard
                  icon={DollarSign}
                  label="Doanh thu tháng này"
                  value={formatCurrency(dashboardData?.currentMonthEarnings || 0)}
                  bg="bg-gradient-to-br from-yellow-50 to-yellow-100"
                  border="border-l-4 border-l-yellow-400"
                  description="Tổng thu nhập tháng này"
                />
              </div>

              {/* Recent Courses */}
              <CoursesList courses={dashboardData?.courses} />
            </>
          )}
        </>
      )}
      {activeTab === "revenue" && <RevenueDashboard />}
    </div>
  );
}

export default LecturerDashboard;