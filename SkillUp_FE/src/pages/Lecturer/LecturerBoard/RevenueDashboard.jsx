import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  BookOpen,
  ShoppingCart,
  Calendar,
} from "lucide-react";
import { lecturerDashboardAPI } from "@/api/lecturerDashboardAPI";
import { toast } from "react-toastify";

function RevenueDashboard() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [isRefetching, setIsRefetching] = useState(false);

  useEffect(() => {
    loadRevenueData(true);
  }, []);

  useEffect(() => {
    // For filters change: use overlay loader, keep previous content
    if (revenueData !== null) {
      loadRevenueData(false);
    }
  }, [selectedYear, selectedCourse]);

  const loadRevenueData = async (firstLoad = false) => {
    try {
      if (firstLoad) setLoading(true);
      else setIsRefetching(true);

      const courseId = selectedCourse === "all" ? null : selectedCourse;
      const response = await lecturerDashboardAPI.getRevenue(
        selectedYear,
        courseId
      );

      if (response.data.code === 200) {
        setRevenueData(response.data.data[0]);
      } else {
        toast.error("Không thể tải dữ liệu doanh thu");
      }
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu doanh thu");
    } finally {
      if (firstLoad) setLoading(false);
      else setIsRefetching(false);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  const getMonthName = (label) => {
    const monthMap = {
      T1: "Tháng 1",
      T2: "Tháng 2",
      T3: "Tháng 3",
      T4: "Tháng 4",
      T5: "Tháng 5",
      T6: "Tháng 6",
      T7: "Tháng 7",
      T8: "Tháng 8",
      T9: "Tháng 9",
      T10: "Tháng 10",
      T11: "Tháng 11",
      T12: "Tháng 12",
    };
    return monthMap[label] || label;
  };

  const formatChartData = () => {
    if (!revenueData?.revenueChart) return [];
    return revenueData.revenueChart
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((item) => ({
        month: getMonthName(item.label),
        revenue: item.revenue,
        shortMonth: item.label,
      }));
  };

  const calculateStats = () => {
    if (!revenueData)
      return { avgRevenue: 0, highestMonth: "-", totalMonths: 0 };

    const chartData = revenueData.revenueChart || [];
    const activeMonths = chartData.filter((m) => m.revenue > 0);
    const avgRevenue =
      activeMonths.length > 0
        ? activeMonths.reduce((sum, m) => sum + m.revenue, 0) /
          activeMonths.length
        : 0;

    const highestMonth = chartData.reduce(
      (max, m) => (m.revenue > max.revenue ? m : max),
      { revenue: 0, label: "-" }
    );

    return {
      avgRevenue,
      highestMonth:
        highestMonth.revenue > 0 ? getMonthName(highestMonth.label) : "-",
      totalMonths: activeMonths.length,
    };
  };

  const stats = calculateStats();
  const chartData = formatChartData();
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 animate-fadeIn">
      {/* Subtle overlay loader for filter changes */}
      {isRefetching && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white bg-opacity-70 backdrop-blur-sm pointer-events-none transition animate-fadeIn-fast">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-yellow-400 border-t-transparent"></div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-gradient-to-r from-yellow-50 to-white p-4 rounded-2xl border border-yellow-200 shadow-lg">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-yellow-600" />
          <label className="text-sm font-semibold text-yellow-900">Năm:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-yellow-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-white font-semibold"
            disabled={isRefetching}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          <label className="text-sm font-semibold text-indigo-900">
            Khóa học:
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border border-indigo-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white min-w-[200px] font-semibold"
            disabled={isRefetching}
          >
            <option value="all">Tất cả khóa học</option>
            {revenueData?.courseRevenues?.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Each card: add fade/hover/bg improvement */}
        <Card className="rounded-2xl shadow-xl transition-transform duration-200 hover:scale-[1.025] bg-gradient-to-br from-lime-50 to-lime-100 border-l-4 border-l-green-400">
          <CardContent className="pt-7 pb-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-green-700 mb-2 font-semibold">
                  Tổng doanh thu
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {formatCurrency(revenueData?.totalLifetimeEarnings || 0)}
                </p>
                <p className="text-xs text-green-600 mt-2">Tất cả thời gian</p>
              </div>
              <div className="p-4 rounded-full bg-green-500 shadow-lg">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-xl transition-transform duration-200 hover:scale-[1.025] bg-gradient-to-br from-sky-50 to-sky-100 border-l-4 border-l-sky-400">
          <CardContent className="pt-7 pb-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-sky-700 mb-2 font-semibold">
                  Doanh thu TB/tháng
                </p>
                <p className="text-3xl font-bold text-sky-900">
                  {formatCurrency(stats.avgRevenue)}
                </p>
                <p className="text-xs text-sky-600 mt-2">
                  {stats.totalMonths} tháng có doanh thu
                </p>
              </div>
              <div className="p-4 rounded-full bg-sky-500 shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-xl transition-transform duration-200 hover:scale-[1.025] bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-l-yellow-400">
          <CardContent className="pt-7 pb-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-yellow-700 mb-2 font-semibold">
                  Tháng cao nhất
                </p>
                <p className="text-3xl font-bold text-yellow-900">
                  {stats.highestMonth}
                </p>
                <p className="text-xs text-yellow-700 mt-2">
                  Năm {selectedYear}
                </p>
              </div>
              <div className="p-4 rounded-full bg-yellow-400 shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="rounded-2xl shadow-xl border-2 border-yellow-200 animate-fadeIn-slow">
        <CardHeader>
          <CardTitle>
            <span className="text-yellow-700 font-bold">
              Biểu đồ doanh thu năm {selectedYear}
            </span>
          </CardTitle>
          <CardDescription>
            {selectedCourse === "all"
              ? "Tất cả khóa học"
              : revenueData?.courseRevenues?.find(
                  (c) => c.courseId === selectedCourse
                )?.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="4 3"
                vertical={false}
                stroke="#f7e098"
              />
              <XAxis
                dataKey="shortMonth"
                style={{ fontSize: "14px", fontWeight: 700, fill: "#fbbf24" }}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                style={{ fontSize: "14px", fontWeight: 700, fill: "#a16207" }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => {
                  const item = chartData.find((d) => d.shortMonth === label);
                  return item ? item.month : label;
                }}
                contentStyle={{
                  backgroundColor: "#fffbe7",
                  border: "2px solid #ffe066",
                  borderRadius: "10px",
                  color: "#544300",
                  fontWeight: 600,
                }}
              />
              <Bar
                dataKey="revenue"
                fill="url(#revenueGradient)"
                radius={[15, 15, 0, 0]}
              />
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#ffe066" />
                  <stop offset="100%" stopColor="#fedc60" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Course Revenue Breakdown */}
      <Card className="rounded-2xl shadow-xl border-2 border-indigo-100 animate-fadeIn-slow">
        <CardHeader>
          <CardTitle className="text-indigo-800 font-bold">
            Doanh thu theo khóa học
          </CardTitle>
          <CardDescription>Chi tiết doanh thu từng khóa học</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueData?.courseRevenues
              ?.filter((c) => c.totalRevenue > 0)
              ?.sort((a, b) => b.totalRevenue - a.totalRevenue)
              ?.map((course) => (
                <div
                  key={course.courseId}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 border border-indigo-100 rounded-xl hover:shadow-lg transition-transform hover:scale-105"
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-16 h-16 object-cover rounded-lg border border-yellow-200 shadow-inner"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/64";
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-indigo-900">
                      {course.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {course.totalSales} lượt bán
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-700">
                      {formatCurrency(course.totalRevenue)}
                    </p>
                  </div>
                </div>
              ))}
            {!revenueData?.courseRevenues?.some((c) => c.totalRevenue > 0) && (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Chưa có doanh thu trong năm {selectedYear}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RevenueDashboard;
