// src/components/systemmod/QuickActionCard. jsx
import React from "react";
import { BellAlertIcon } from "@heroicons/react/24/outline";

const colorSchemes = {
  yellow: {
    bg: "bg-amber-50/50",
    border: "border-amber-100",
    hoverBorder: "hover:border-amber-200",
    icon: "bg-amber-500/10",
    iconColor: "text-amber-600",
  },
  orange: {
    bg: "bg-orange-50/50",
    border: "border-orange-100",
    hoverBorder: "hover:border-orange-200",
    icon: "bg-orange-500/10",
    iconColor: "text-orange-600",
  },
  red: {
    bg: "bg-rose-50/50",
    border: "border-rose-100",
    hoverBorder: "hover:border-rose-200",
    icon: "bg-rose-500/10",
    iconColor: "text-rose-600",
  },
};

export const QuickActionCard = ({ title, count, icon: Icon, color, urgent, onClick }) => {
  const scheme = colorSchemes[color];
  return (
    <div
      onClick={onClick}
      className={`relative ${scheme.bg} rounded-3xl p-5 border ${scheme.border} ${scheme.hoverBorder} hover:shadow-md transition-all duration-300 cursor-pointer group`}
    >
      {urgent && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
          <BellAlertIcon className="w-4 h-4 text-white animate-pulse" />
        </div>
      )}
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl ${scheme.icon} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
        >
          <Icon className={`w-6 h-6 ${scheme.iconColor}`} strokeWidth={2} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">{count}</p>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </div>
    </div>
  );
};