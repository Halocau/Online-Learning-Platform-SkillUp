// src/components/lecturer/RevenueFilters.jsx
import React from "react";
import { Calendar, BookOpen } from "lucide-react";

export const RevenueFilters = ({ 
  selectedYear, 
  setSelectedYear, 
  selectedCourse, 
  setSelectedCourse, 
  courses, 
  years,
  disabled 
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-between bg-gradient-to-r from-yellow-50 to-white p-4 rounded-2xl border border-yellow-200 shadow-lg">
      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5 text-yellow-600" />
        <label className="text-sm font-semibold text-yellow-900">Năm:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2 border border-yellow-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-white font-semibold"
          disabled={disabled}
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
        <label className="text-sm font-semibold text-indigo-900">Khóa học:</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-4 py-2 border border-indigo-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white min-w-[200px] font-semibold"
          disabled={disabled}
        >
          <option value="all">Tất cả khóa học</option>
          {courses?. map((course) => (
            <option key={course.courseId} value={course.courseId}>
              {course.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};