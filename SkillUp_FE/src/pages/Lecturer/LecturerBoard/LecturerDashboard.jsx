import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  DollarSign,
  BookOpen,
  ArrowRight,
  DollarSign as DollarSignIcon,
} from "lucide-react";
import { lecturerDashboardAPI } from "@/api/lecturerDashboardAPI";
import { toast } from "react-toastify";
import RevenueDashboard from "./RevenueDashboard";

function LecturerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === "overview") {
      loadDashboardData();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await lecturerDashboardAPI.getViewDashboard();

      if (response.data.code === 200) {
        setDashboardData(response.data.data[0]);
      } else {
        toast.error("Không thể tải dữ liệu dashboard");
      }
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Improved Stat Card with pastel gradient backgrounds and icon ring highlights
  const StatCard = ({ icon: Icon, label, value, bg, border, description }) => (
    <Card
      className={`rounded-2xl shadow-xl transition-transform duration-200 hover:scale-[1.025] ${bg} ${border}`}
    >
      <CardContent className="pt-7 pb-7">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold mb-2 opacity-75">{label}</p>
            <p className="text-3xl font-bold mb-1">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-2">{description}</p>
            )}
          </div>
          <div className="p-4 rounded-full bg-white shadow-md ring-2 ring-offset-2 ring-yellow-300 flex items-center justify-center">
            <Icon className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
                <StatCard
                  icon={BookOpen}
                  label="Khóa học"
                  value={dashboardData?.totalCourses || 0}
                  bg="bg-gradient-to-br from-blue-50 to-blue-100"
                  border="border-l-4 border-l-blue-400"
                  description="Tổng số khóa học bạn đã tạo"
                />
                <StatCard
                  icon={Users}
                  label="Học viên"
                  value={dashboardData?.totalStudents || 0}
                  bg="bg-gradient-to-br from-green-50 to-green-100"
                  border="border-l-4 border-l-green-400"
                  description="Tổng học viên đăng ký các khoá bạn dạy"
                />
                <StatCard
                  icon={DollarSign}
                  label="Doanh thu tháng này"
                  value={formatCurrency(
                    dashboardData?.currentMonthEarnings || 0
                  )}
                  bg="bg-gradient-to-br from-yellow-50 to-yellow-100"
                  border="border-l-4 border-l-yellow-400"
                  description="Tổng thu nhập tháng này"
                />
              </div>

              {/* Recent Courses */}
              <Card className="rounded-2xl shadow-lg border-2 border-yellow-50">
                <CardHeader>
                  <CardTitle>
                    <span className="text-yellow-900 font-bold text-xl">Khóa học của bạn</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData?.courses?.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.courses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center justify-between gap-4 p-3 bg-gradient-to-r from-yellow-50 to-white border border-yellow-100 rounded-xl hover:shadow-lg transition hover:scale-[1.01]"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <img
                              src={course.image}
                              alt={course.title}
                              className="w-16 h-16 object-cover rounded-lg border border-yellow-200 shadow-inner"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/64";
                              }}
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{course.title}</p>
                              <p className="text-sm text-gray-700">
                                {course.totalStudents} học viên • {course.totalLessons} bài học
                              </p>
                            </div>
                          </div>
                          <Button variant="secondary" size="sm" className="rounded-full hover:bg-yellow-100">
                            <ArrowRight className="w-5 h-5 text-yellow-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Chưa có khóa học nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
      {activeTab === "revenue" && <RevenueDashboard />}
    </div>
  );
}

export default LecturerDashboard;