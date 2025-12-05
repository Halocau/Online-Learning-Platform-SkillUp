// src/components/course-detail/CourseDetailHero.jsx
import { Users, Globe, BookOpen, Calendar } from "lucide-react";
import StarRating from "@/components/ui/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CourseDetailHero({ course }) {
  return (
    <section className="border-b border-[#272343]/10 bg-gradient-to-b from-[#fff8e1] via-[#fffffe] to-[#e3f6f5]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
          {/* Left: title, meta */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#272343]/10 bg-[#fffffe]/80 px-3 py-1 text-xs font-medium tracking-tight text-[#2d334a]">
              <BookOpen className="h-3.5 w-3.5 text-[#FFD54F]" />
              <span>Khóa học · {course.categoryName}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight text-[#272343]">
              {course.title}
            </h1>

            <p className="text-base lg:text-lg leading-relaxed text-[#2d334a]">
              {course.description ||
                "Làm chủ kiến thức, tối ưu trải nghiệm người dùng và sẵn sàng đi làm."}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[#2d334a]">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs sm:text-xs">
                  <span className="text-sm font-semibold text-[#272343]">
                    {course.rating.toFixed(1)}
                  </span>
                  <div className="flex gap-0.5">
                    <StarRating rating={course.rating} size="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[#6b7280]">
                    ({course.enrollmentCount} đánh giá)
                  </span>
                </div>
              </div>

              <div className="h-4 w-px bg-[#cbd5e1]"></div>

              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Users className="h-4 w-4 text-[#272343]" />
                <span>{course.enrollmentCount.toLocaleString()} học viên</span>
              </div>

              <div className="h-4 w-px bg-[#cbd5e1]"></div>
            </div>

            {/* Lecturer Information */}
            {course.lecturer && (
              <div className="flex items-center gap-3 text-sm text-[#2d334a]">
                <span>Tạo bởi</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 border border-[#FFD54F]/50">
                    <AvatarImage src={course.lecturer.avartar} />
                    <AvatarFallback className="bg-[#FFD54F]/20 text-[#272343] text-xs font-semibold">
                      {course.lecturer.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-[#272343] hover:text-[#FFD54F] transition-colors cursor-pointer">
                    {course.lecturer.fullName}
                  </span>
                  {course.lecturer.profession && (
                    <>
                      <span className="text-[#6b7280]">·</span>
                      <span className="text-[#6b7280]">
                        {course.lecturer.profession}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Last Updated & Language Info */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#6b7280]">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Cập nhật lần cuối{" "}
                  {new Date(course.updatedAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Enrollment Card Placeholder - This will be rendered separately */}
          <div className="w-full lg:max-w-sm">
            {/* Enrollment card will be placed here in parent component */}
          </div>
        </div>
      </div>
    </section>
  );
}
