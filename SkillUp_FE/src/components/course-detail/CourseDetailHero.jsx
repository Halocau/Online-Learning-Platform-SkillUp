// src/components/course-detail/CourseDetailHero.jsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Calendar, Globe } from "lucide-react";
import StarRating from "@/components/ui/StarRating";

export default function CourseDetailHero({ course }) {
  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">

      <div className="relative max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-[#FFD54F]/20 text-[#FFD54F] rounded-full font-medium">
                {course.categoryName}
              </span>
              <span className="text-gray-400">›</span>
              <span className="text-gray-300">{course.subCategoryName}</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {course.title}
            </h1>

            <p className="text-lg text-gray-300 leading-relaxed">
              {course.description}
            </p>

            {/* Stats with modern cards */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="font-bold text-2xl text-[#FFD54F]">
                  {course.rating.toFixed(1)}
                </span>
                <div className="flex gap-0.5">
                  <StarRating rating={course.rating} />
                </div>
                <span className="text-gray-300 text-sm">
                  ({course.enrollmentCount} đánh giá)
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <Users className="w-5 h-5 text-[#FFD54F]" />
                <span className="font-semibold">
                  {course.enrollmentCount.toLocaleString()}
                </span>
                <span className="text-gray-300 text-sm">học viên</span>
              </div>
            </div>

            {/* Instructor Card */}
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <Avatar className="w-14 h-14 border-2 border-[#FFD54F]">
                <AvatarImage src={course.lecturer.avartar} />
                <AvatarFallback className="bg-[#FFD54F] text-gray-900">
                  {course.lecturer.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-gray-400">Giảng viên</p>
                <p className="font-semibold text-lg">
                  {course.lecturer.fullName}
                </p>
                <p className="text-sm text-gray-300">
                  {course.lecturer.profession}
                </p>
              </div>
            </div>

            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Cập nhật{" "}
                  {new Date(course.updatedAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
