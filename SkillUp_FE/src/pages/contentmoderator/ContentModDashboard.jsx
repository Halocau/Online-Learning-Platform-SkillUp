// src/pages/contentmoderator/ContentModeratorDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  NewspaperIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FolderIcon,
  PhotoIcon,
  BookOpenIcon,
  ClockIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { Spin } from "antd";
import { modDashboardAPI } from "@/api/modDashboardAPI";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/ui/card";

import dayjs from "dayjs";

import { ContentCharts } from "@/components/Dashboard/contentmod/ContentCharts";
import { CourseOverview } from "@/components/Dashboard/contentmod/CourseOverview";

export default function ContentModeratorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await modDashboardAPI.getContentModDashboard();

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
        {" "}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold mb-1.5 opacity-75">{title}</p>{" "}
            <p className="text-2xl font-bold mb-1">{value}</p>{" "}
          </div>
          <div className="p-3 rounded-full bg-white shadow-md ring-2 ring-offset-2 ring-purple-300 flex items-center justify-center">
            {" "}
            <Icon className="w-6 h-6 text-purple-600" />{" "}
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

  const courseStats = dashboardData.courseStatistics;

  const recentCoursesActivity = courseStats.publishedCourses
    .slice(0, 7)
    .reverse()
    .map((course) => ({
      date: dayjs(course.createdAt).format("DD/MM"),
      courses: 1,
    }))
    .reduce((acc, curr) => {
      const existing = acc.find((item) => item.date === curr.date);
      if (existing) {
        existing.courses += 1;
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
      </div>

      {/* Priority Alert */}
      {dashboardData.totalUnresolvedCommentReports > 0 && (
        <div
          onClick={() => navigate("/contentmod/rpcmt? status=unresolved")}
          className="mb-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between flex-wrap gap-4 text-white">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-white/20">
                <ExclamationTriangleIcon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xl font-bold">
                  {dashboardData.totalUnresolvedCommentReports} báo cáo chưa xử
                  lý
                </p>
                <p className="text-white/90 text-sm">
                  Cần kiểm duyệt và xử lý ngay
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Tổng quan nội dung
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Tin tức"
            value={dashboardData.totalNews}
            icon={NewspaperIcon}
            bg="bg-gradient-to-br from-blue-50 to-blue-100"
            border="border-l-4 border-l-blue-400"
            onClick={() => navigate("/contentmod/news")}
          />
          <StatCard
            title="Bài viết"
            value={dashboardData.totalPosts}
            icon={ChatBubbleLeftRightIcon}
            bg="bg-gradient-to-br from-green-50 to-green-100"
            border="border-l-4 border-l-green-400"
            onClick={() => navigate("/contentmod/forum")}
          />
          <StatCard
            title="Danh mục"
            value={dashboardData.totalCategories}
            icon={FolderIcon}
            bg="bg-gradient-to-br from-purple-50 to-purple-100"
            border="border-l-4 border-l-purple-400"
            onClick={() => navigate("/contentmod/category")}
          />
          <StatCard
            title="Banner"
            value={dashboardData.totalBanners}
            icon={PhotoIcon}
            bg="bg-gradient-to-br from-orange-50 to-orange-100"
            border="border-l-4 border-l-orange-400"
            onClick={() => navigate("/contentmod/banner")}
          />
          <StatCard
            title="Đã xử lý"
            value={dashboardData.totalResolvedCommentReports}
            icon={CheckCircleIcon}
            bg="bg-gradient-to-br from-green-50 to-green-100"
            border="border-l-4 border-l-green-400"
            onClick={() => navigate("/contentmod/rpcmt")}
          />
          <StatCard
            title="Chưa xử lý"
            value={dashboardData.totalUnresolvedCommentReports}
            icon={ExclamationTriangleIcon}
            bg="bg-gradient-to-br from-red-50 to-red-100"
            border="border-l-4 border-l-red-400"
            onClick={() => navigate("/contentmod/rpcmt")}
          />
        </div>
      </div>

      {/* Course Stats */}
      {/* <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Khóa học</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Công khai"
            value={courseStats.publish}
            icon={BookOpenIcon}
            bg="bg-gradient-to-br from-green-50 to-green-100"
            border="border-l-4 border-l-green-400"
            onClick={() => navigate("/contentmod/course")}
          />
          <StatCard
            title="Chờ duyệt"
            value={courseStats.pending}
            icon={ClockIcon}
            bg="bg-gradient-to-br from-yellow-50 to-yellow-100"
            border="border-l-4 border-l-yellow-400"
            onClick={() => navigate("/contentmod/course")}
          />
          <StatCard
            title="Bị ẩn"
            value={courseStats.unpublish}
            icon={EyeSlashIcon}
            bg="bg-gradient-to-br from-gray-50 to-gray-100"
            border="border-l-4 border-l-gray-400"
            onClick={() => navigate("/contentmod/course")}
          />
          <StatCard
            title="Báo cáo"
            value={courseStats.reportCourse}
            icon={ExclamationTriangleIcon}
            bg="bg-gradient-to-br from-red-50 to-red-100"
            border="border-l-4 border-l-red-400"
            onClick={() => navigate("/contentmod/course")}
          />
        </div>
      </div> */}

      {/* Charts */}
      <ContentCharts
        dashboardData={dashboardData}
        courseStats={courseStats}
        recentActivity={recentCoursesActivity}
      />

      {/* Course Lists */}
      <div className="mt-8">
        <CourseOverview courseStats={courseStats} navigate={navigate} />
      </div>
    </div>
  );
}
