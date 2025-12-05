// src/components/lecturer/CourseRevenueBreakdown. jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export const CourseRevenueBreakdown = ({ courses, formatCurrency, selectedYear }) => {
  const activeCourses = courses?. filter((c) => c.totalRevenue > 0)?.sort((a, b) => b.totalRevenue - a. totalRevenue);

  return (
    <Card className="rounded-2xl shadow-xl border-2 border-indigo-100 animate-fadeIn-slow">
      <CardHeader>
        <CardTitle className="text-indigo-800 font-bold">Doanh thu theo khóa học</CardTitle>
        <CardDescription>Chi tiết doanh thu từng khóa học</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeCourses?.length > 0 ? (
            activeCourses.map((course) => (
              <div
                key={course.courseId}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 border border-indigo-100 rounded-xl hover:shadow-lg transition-transform hover:scale-105"
              >
                <img
                  src={course.image}
                  alt={course. title}
                  className="w-16 h-16 object-cover rounded-lg border border-yellow-200 shadow-inner"
                  onError={(e) => {
                    e.target.src = "https://via. placeholder.com/64";
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-indigo-900">{course.title}</h4>
                  <p className="text-sm text-gray-600">{course.totalSales} lượt bán</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-700">{formatCurrency(course.totalRevenue)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Chưa có doanh thu trong năm {selectedYear}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};