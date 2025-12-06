// src/pages/lecturer/RevenueDashboard.jsx
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";
import { lecturerDashboardAPI } from "@/api/lecturerDashboardAPI";
import { toast } from "react-toastify";
import { RevenueFilters } from "@/components/Dashboard/lecturer/RevenueFilters";
import { RevenueChart } from "@/components/Dashboard/lecturer/RevenueChart";
import { CourseRevenueBreakdown } from "@/components/Dashboard/lecturer/CourseRevenue";


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
    if (revenueData !== null) {
      loadRevenueData(false);
    }
  }, [selectedYear, selectedCourse]);

  const loadRevenueData = async (firstLoad = false) => {
    try {
      if (firstLoad) setLoading(true);
      else setIsRefetching(true);

      const courseId = selectedCourse === "all" ? null : selectedCourse;
      const response = await lecturerDashboardAPI.getRevenue(selectedYear, courseId);

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
    }). format(value);

  const getMonthName = (label) => {
    const monthMap = {
      T1: "Tháng 1", T2: "Tháng 2", T3: "Tháng 3", T4: "Tháng 4",
      T5: "Tháng 5", T6: "Tháng 6", T7: "Tháng 7", T8: "Tháng 8",
      T9: "Tháng 9", T10: "Tháng 10", T11: "Tháng 11", T12: "Tháng 12",
    };
    return monthMap[label] || label;
  };

  const formatChartData = () => {
    if (!revenueData?. revenueChart) return [];
    return revenueData.revenueChart
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((item) => ({
        month: getMonthName(item.label),
        revenue: item.revenue,
        shortMonth: item.label,
      }));
  };

  const calculateStats = () => {
    if (! revenueData) return { avgRevenue: 0, highestMonth: "-", totalMonths: 0 };

    const chartData = revenueData.revenueChart || [];
    const activeMonths = chartData.filter((m) => m.revenue > 0);
    const avgRevenue =
      activeMonths.length > 0
        ? activeMonths.reduce((sum, m) => sum + m.revenue, 0) / activeMonths. length
        : 0;

    const highestMonth = chartData.reduce(
      (max, m) => (m.revenue > max.revenue ? m : max),
      { revenue: 0, label: "-" }
    );

    return {
      avgRevenue,
      highestMonth: highestMonth.revenue > 0 ? getMonthName(highestMonth. label) : "-",
      totalMonths: activeMonths.length,
    };
  };

  const stats = calculateStats();
  const chartData = formatChartData();
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  const courseTitle = revenueData?.courseRevenues?.find((c) => c.courseId === selectedCourse)?.title;

  return (
    <div className="relative space-y-6 animate-fadeIn">
      {/* Overlay loader */}
      {isRefetching && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white bg-opacity-70 backdrop-blur-sm pointer-events-none transition animate-fadeIn-fast">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-yellow-400 border-t-transparent"></div>
        </div>
      )}

      {/* Filters */}
      <RevenueFilters
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        courses={revenueData?.courseRevenues}
        years={years}
        disabled={isRefetching}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-xl transition-transform duration-200 hover:scale-[1.025] bg-gradient-to-br from-lime-50 to-lime-100 border-l-4 border-l-green-400">
          <CardContent className="pt-7 pb-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-green-700 mb-2 font-semibold">Tổng doanh thu</p>
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
                <p className="text-sm text-sky-700 mb-2 font-semibold">Doanh thu TB/tháng</p>
                <p className="text-3xl font-bold text-sky-900">{formatCurrency(stats.avgRevenue)}</p>
                <p className="text-xs text-sky-600 mt-2">{stats.totalMonths} tháng có doanh thu</p>
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
                <p className="text-sm text-yellow-700 mb-2 font-semibold">Tháng cao nhất</p>
                <p className="text-3xl font-bold text-yellow-900">{stats.highestMonth}</p>
                <p className="text-xs text-yellow-700 mt-2">Năm {selectedYear}</p>
              </div>
              <div className="p-4 rounded-full bg-yellow-400 shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <RevenueChart
        data={chartData}
        selectedYear={selectedYear}
        selectedCourse={selectedCourse}
        courseTitle={courseTitle}
        formatCurrency={formatCurrency}
      />

      {/* Course Revenue Breakdown */}
      <CourseRevenueBreakdown
        courses={revenueData?. courseRevenues}
        formatCurrency={formatCurrency}
        selectedYear={selectedYear}
      />
    </div>
  );
}

export default RevenueDashboard;