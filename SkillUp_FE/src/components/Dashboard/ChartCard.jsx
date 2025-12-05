// src/components/dashboard/ChartCard. jsx
import React from "react";

export const ChartCard = ({ icon: Icon, iconColor, title, children, className = "" }) => {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-xl ${iconColor} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor. replace('bg-', 'text-'). replace('/10', '')}`} strokeWidth={2} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
};