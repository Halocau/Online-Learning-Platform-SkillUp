// src/components/contentmoderator/CourseOverview.jsx
import React from "react";
import {
  BookOpenIcon,
  ClockIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import { CourseCard } from "./CourseCard";
import { StatCard } from "../StatCard";

export const CourseOverview = ({ courseStats, navigate }) => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
          <BookOpenIcon className="w-5 h-5 text-purple-600" strokeWidth={2} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Khóa học</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Công khai"
          value={courseStats.publish}
          icon={BookOpenIcon}
          color="green"
          onClick={() => navigate("/contentmod/course")}
        />
        <StatCard
          title="Chờ duyệt"
          value={courseStats.pending}
          icon={ClockIcon}
          color="yellow"
          onClick={() => navigate("/contentmod/course")}
        />
        <StatCard
          title="Bị ẩn"
          value={courseStats.unpublish}
          icon={EyeSlashIcon}
          color="gray"
          onClick={() => navigate("/contentmod/course")}
        />
        <StatCard
          title="Báo cáo"
          value={courseStats.reportCourse}
          icon={ExclamationTriangleIcon}
          color="red"
          onClick={() => navigate("/contentmod/course")}
        />
      </div>

      {/* Course Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Published Courses */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <BookOpenIcon
                className="w-4 h-4 text-emerald-600"
                strokeWidth={2}
              />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Mới xuất bản</h3>
            <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2. 5 py-1 rounded-full font-medium">
              Top 5
            </span>
          </div>
          <div className="space-y-3">
            {courseStats.publishedCourses.slice(0, 5).map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                status="published"
                onClick={() => navigate(`/contentmod/course`)}
              />
            ))}
          </div>
        </div>

        {/* Pending Courses */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <ClockIcon className="w-4 h-4 text-amber-600" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Chờ phê duyệt</h3>
            <span className="ml-auto px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
              {courseStats.pendingApprovalCourses.length}
            </span>
          </div>
          <div className="space-y-3">
            {courseStats.pendingApprovalCourses.length > 0 ? (
              courseStats.pendingApprovalCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  status="pending"
                  onClick={() => navigate(`/contentmod/course`)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <ClockIcon className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm">
                  Không có khóa học chờ duyệt
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
