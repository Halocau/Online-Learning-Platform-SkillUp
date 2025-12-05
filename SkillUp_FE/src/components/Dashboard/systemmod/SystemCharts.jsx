// src/components/systemmod/SystemCharts.jsx
import React from "react";
import {
  ChartBarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  TicketIcon,
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
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CustomTooltip } from "../CustomTooltip";
import { ChartCard } from "../ChartCard";

// Updated label renderer - hide 0% values
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  value,
}) => {
  if (value === 0 || percent === 0) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-sm font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom Tooltip for Stacked Bar Chart
const CustomStackedBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-600">{entry.name}:</span>
            <span className="text-sm font-bold" style={{ color: entry.color }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Simple Bar Chart
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p
          className="text-lg font-bold"
          style={{ color: payload[0].payload.color }}
        >
          Số lượng: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export const SystemCharts = ({ dashboardData }) => {
  // Filter out zero values from the data
  const lecturerData = [
    {
      name: "Hoạt động",
      value: dashboardData.activeLecturerCount,
      color: "#10b981",
      fill: "#10b981",
    },
    {
      name: "Không HĐ",
      value: dashboardData.inactiveLecturerCount,
      color: "#64748b",
      fill: "#64748b",
    },
    {
      name: "Bị cấm",
      value: dashboardData.bannedLecturerCount,
      color: "#ef4444",
      fill: "#ef4444",
    },
  ].filter((item) => item.value > 0);

  const studentData = [
    {
      name: "Hoạt động",
      value: dashboardData.activeStudentCount,
      color: "#3b82f6",
      fill: "#3b82f6",
    },
    {
      name: "Không HĐ",
      value: dashboardData.inactiveStudentCount,
      color: "#64748b",
      fill: "#64748b",
    },
    {
      name: "Bị cấm",
      value: dashboardData.bannedStudentCount,
      color: "#ef4444",
      fill: "#ef4444",
    },
  ].filter((item) => item.value > 0);

  const ticketData = [
    {
      name: "Chờ xử lý",
      value: dashboardData.pendingTicketCount,
      color: "#f59e0b",
    },
    {
      name: "Đã giải quyết",
      value: dashboardData.solvedTicketCount,
      color: "#10b981",
    },
  ].filter((item) => item.value > 0);

  const applicationData = [
    {
      name: "Chờ duyệt",
      value: dashboardData.pendingLecturerApplicationCount,
      color: "#f97316",
    },
    {
      name: "Chấp nhận",
      value: dashboardData.lecturerApplicationAcceptedCount,
      color: "#10b981",
    },
    {
      name: "Từ chối",
      value: dashboardData.lecturerApplicationRejectedCount,
      color: "#ef4444",
    },
  ].filter((item) => item.value > 0);

  const userComparisonData = [
    {
      name: "Giảng viên",
      active: dashboardData.activeLecturerCount,
      inactive: dashboardData.inactiveLecturerCount,
      banned: dashboardData.bannedLecturerCount,
    },
    {
      name: "Học viên",
      active: dashboardData.activeStudentCount,
      inactive: dashboardData.inactiveStudentCount,
      banned: dashboardData.bannedStudentCount,
    },
  ];

  return (
    <>
      {/* User Comparison */}
      <ChartCard
        icon={ChartBarIcon}
        iconColor="bg-blue-500/10"
        title="So sánh người dùng"
        className="lg:col-span-2"
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={userComparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <Tooltip content={<CustomStackedBarTooltip />} /> {/* Updated */}
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              iconType="circle"
            />
            <Bar
              dataKey="active"
              name="Hoạt động"
              fill="#10b981"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="inactive"
              name="Không hoạt động"
              fill="#64748b"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="banned"
              name="Bị cấm"
              fill="#ef4444"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Lecturer Distribution */}
      <ChartCard
        icon={AcademicCapIcon}
        iconColor="bg-emerald-500/10"
        title="Phân bố Giảng viên"
      >
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={lecturerData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {lecturerData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#10b981" }}
            />
            <span className="text-xs text-gray-600">
              Hoạt động: {dashboardData.activeLecturerCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#64748b" }}
            />
            <span className="text-xs text-gray-600">
              Không HĐ: {dashboardData.inactiveLecturerCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#ef4444" }}
            />
            <span className="text-xs text-gray-600">
              Bị cấm: {dashboardData.bannedLecturerCount}
            </span>
          </div>
        </div>
      </ChartCard>

      {/* Student Distribution */}
      <ChartCard
        icon={UserGroupIcon}
        iconColor="bg-blue-500/10"
        title="Phân bố Học viên"
      >
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={studentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {studentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#3b82f6" }}
            />
            <span className="text-xs text-gray-600">
              Hoạt động: {dashboardData.activeStudentCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#64748b" }}
            />
            <span className="text-xs text-gray-600">
              Không HĐ: {dashboardData.inactiveStudentCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#ef4444" }}
            />
            <span className="text-xs text-gray-600">
              Bị cấm: {dashboardData.bannedStudentCount}
            </span>
          </div>
        </div>
      </ChartCard>

      {/* Ticket Status */}
      <ChartCard
        icon={TicketIcon}
        iconColor="bg-amber-500/10"
        title="Trạng thái Ticket"
      >
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={ticketData}
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
              {ticketData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-4">
          {ticketData.map((item, index) => (
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

      {/* Application Status */}
      <ChartCard
        icon={AcademicCapIcon}
        iconColor="bg-purple-500/10"
        title="Đơn đăng ký GV"
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={applicationData}>
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
              {applicationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );
};
