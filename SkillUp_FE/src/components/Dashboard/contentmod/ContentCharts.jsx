// src/components/contentmoderator/ContentCharts.jsx
import React from "react";
import {
  ChartBarIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { CustomTooltip, renderCustomizedLabel } from "../CustomTooltip";
import { ChartCard } from "../ChartCard";

// Custom Tooltip for Bar Chart with Vietnamese labels
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-lg font-bold text-emerald-600">
          Số lượng: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Area Chart with Vietnamese labels
const CustomAreaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-lg font-bold text-emerald-600">
          Khóa học: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export const ContentCharts = ({
  dashboardData,
  courseStats,
  recentActivity,
}) => {
  const contentOverviewData = [
    { name: "Tin tức", value: dashboardData.totalNews, color: "#3b82f6" },
    { name: "Bài viết", value: dashboardData.totalPosts, color: "#10b981" },
    {
      name: "Danh mục",
      value: dashboardData.totalCategories,
      color: "#a855f7",
    },
    { name: "Banner", value: dashboardData.totalBanners, color: "#f97316" },
  ];

  const courseStatusData = [
    { name: "Công khai", value: courseStats.publish, color: "#10b981" },
    { name: "Chờ duyệt", value: courseStats.pending, color: "#f59e0b" },
    { name: "Bị ẩn", value: courseStats.unpublish, color: "#64748b" },
    { name: "Báo cáo", value: courseStats.reportCourse, color: "#ef4444" },
  ];

  const reportStatusData = [
    {
      name: "Đã xử lý",
      value: dashboardData.totalResolvedCommentReports,
      color: "#10b981",
    },
    {
      name: "Chưa xử lý",
      value: dashboardData.totalUnresolvedCommentReports,
      color: "#ef4444",
    },
  ];

  return (
    <>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Distribution */}
        <ChartCard
          icon={ChartBarIcon}
          iconColor="bg-blue-500/10"
          title="Phân bố nội dung"
        >
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={contentOverviewData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {contentOverviewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {contentOverviewData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Course Status */}
        <ChartCard
          icon={BookOpenIcon}
          iconColor="bg-purple-500/10"
          title="Trạng thái khóa học"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={courseStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <Tooltip content={<CustomBarTooltip />} /> {/* Updated */}
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {courseStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Report Status */}
        <ChartCard
          icon={ExclamationTriangleIcon}
          iconColor="bg-rose-500/10"
          title="Báo cáo bình luận"
        >
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={reportStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {reportStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {reportStatusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <ChartCard
          icon={ChartBarIcon}
          iconColor="bg-emerald-500/10"
          title="Hoạt động xuất bản gần đây"
        >
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={recentActivity}>
              <defs>
                <linearGradient id="colorCourses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <Tooltip content={<CustomAreaTooltip />} /> {/* Updated */}
              <Area
                type="monotone"
                dataKey="courses"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCourses)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </>
  );
};
