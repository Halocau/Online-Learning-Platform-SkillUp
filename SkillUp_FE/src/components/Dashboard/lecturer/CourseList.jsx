// src/components/lecturer/CoursesList.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";

export const CoursesList = ({ courses }) => {
  return (
    <Card className="rounded-2xl shadow-lg border-2 border-yellow-50">
      <CardHeader>
        <CardTitle>
          <span className="text-yellow-900 font-bold text-xl">Khóa học của bạn</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {courses?. length > 0 ? (
          <div className="space-y-4">
            {courses.slice(0, 5).map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between gap-4 p-3 bg-gradient-to-r from-yellow-50 to-white border border-yellow-100 rounded-xl hover:shadow-lg transition hover:scale-[1.01]"
              >
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={course.image}
                    alt={course. title}
                    className="w-16 h-16 object-cover rounded-lg border border-yellow-200 shadow-inner"
                    onError={(e) => {
                      e.target.src = "https://via. placeholder.com/64";
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{course.title}</p>
                    <p className="text-sm text-gray-700">
                      {course.totalStudents} học viên • {course.totalLessons} bài học
                    </p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" className="rounded-full hover:bg-yellow-100">
                  <ArrowRight className="w-5 h-5 text-yellow-600" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Chưa có khóa học nào</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};