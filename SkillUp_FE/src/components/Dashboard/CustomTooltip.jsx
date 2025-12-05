// src/components/dashboard/CustomTooltip.jsx
import React from "react";

export const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-800">{payload[0].name}</p>
        <p
          className="text-lg font-bold"
          style={{ color: payload[0].payload.color || payload[0].color }}
        >
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
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
