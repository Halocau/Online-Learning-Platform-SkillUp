// src/components/lecturer/RevenueChart.jsx
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Custom Tooltip for Revenue Chart
const CustomRevenueTooltip = ({ active, payload, label, formatCurrency, data }) => {
  if (active && payload && payload.length) {
    const item = data.find((d) => d. shortMonth === label);
    const monthName = item ? item.month : label;
    
    return (
      <div
        style={{
          backgroundColor: "#fffbe7",
          border: "2px solid #ffe066",
          borderRadius: "10px",
          padding: "12px 16px",
          color: "#544300",
          fontWeight: 600,
        }}
      >
        <p className="text-sm font-semibold mb-1">{monthName}</p>
        <p className="text-base font-bold text-yellow-700">
          Doanh thu: {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export const RevenueChart = ({
  data,
  selectedYear,
  selectedCourse,
  courseTitle,
  formatCurrency,
}) => {
  return (
    <Card className="rounded-2xl shadow-xl border-2 border-yellow-200 animate-fadeIn-slow">
      <CardHeader>
        <CardTitle>
          <span className="text-yellow-700 font-bold">
            Biểu đồ doanh thu năm {selectedYear}
          </span>
        </CardTitle>
        <CardDescription>
          {selectedCourse === "all" ?  "Tất cả khóa học" : courseTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={data}>
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
              content={<CustomRevenueTooltip formatCurrency={formatCurrency} data={data} />}
            />
            <Bar
              dataKey="revenue"
              fill="url(#revenueGradient)"
              radius={[15, 15, 0, 0]}
            />
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffe066" />
                <stop offset="100%" stopColor="#fedc60" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};