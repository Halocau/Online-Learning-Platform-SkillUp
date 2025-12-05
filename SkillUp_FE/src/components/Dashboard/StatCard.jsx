// src/components/dashboard/StatCard.jsx
import React from "react";

const colorSchemes = {
  blue: {
    bg: "bg-blue-50/50",
    border: "border-blue-100",
    hoverBorder: "hover:border-blue-200",
    icon: "bg-blue-500/10",
    iconColor: "text-blue-600",
  },
  green: {
    bg: "bg-emerald-50/50",
    border: "border-emerald-100",
    hoverBorder: "hover:border-emerald-200",
    icon: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
  },
  purple: {
    bg: "bg-purple-50/50",
    border: "border-purple-100",
    hoverBorder: "hover:border-purple-200",
    icon: "bg-purple-500/10",
    iconColor: "text-purple-600",
  },
  orange: {
    bg: "bg-orange-50/50",
    border: "border-orange-100",
    hoverBorder: "hover:border-orange-200",
    icon: "bg-orange-500/10",
    iconColor: "text-orange-600",
  },
  yellow: {
    bg: "bg-amber-50/50",
    border: "border-amber-100",
    hoverBorder: "hover:border-amber-200",
    icon: "bg-amber-500/10",
    iconColor: "text-amber-600",
  },
  red: {
    bg: "bg-rose-50/50",
    border: "border-rose-100",
    hoverBorder: "hover:border-rose-200",
    icon: "bg-rose-500/10",
    iconColor: "text-rose-600",
  },
  gray: {
    bg: "bg-slate-50/50",
    border: "border-slate-100",
    hoverBorder: "hover:border-slate-200",
    icon: "bg-slate-500/10",
    iconColor: "text-slate-600",
  },
};

export const StatCard = ({ title, value, icon: Icon, color, onClick }) => {
  const scheme = colorSchemes[color];
  return (
    <div
      onClick={onClick}
      className={`group ${scheme.bg} rounded-2xl p-4 transition-all duration-300 border ${scheme.border} ${scheme.hoverBorder} hover:shadow-lg ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1. 5">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div
          className={`w-10 h-10 rounded-xl ${scheme.icon} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
        >
          <Icon className={`w-5 h-5 ${scheme.iconColor}`} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
};