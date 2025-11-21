// src/components/course-detail/MoreCoursesByLecturerSection.jsx
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function MoreCoursesByLecturerSection({ 
  lecturerName, 
  lecturerId,
  courses = [] // Pass related courses if available
}) {
  return (
    <section aria-labelledby="more-course-by" className="rounded-2xl border border-[#e5e7eb] bg-[#fffffe] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 id="more-course-by" className="text-sm font-semibold tracking-tight text-[#272343]">
          Khóa học khác của {lecturerName}
        </h2>
        {lecturerId && (
          <Link 
            to={`/lecturer/${lecturerId}/courses`}
            className="text-xs font-medium text-[#4b5563] hover:text-[#272343] transition-colors"
          >
            Xem tất cả
          </Link>
        )}
      </div>
      
      {courses.length > 0 ? (
        <div className="mt-3 space-y-3">
          {courses.slice(0, 2).map((course) => (
            <Link
              key={course.id}
              to={`/course/${course.id}`}
              className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-[#fdfaf1] p-3 hover:border-[#FFD54F]/50 hover:bg-[#fff8e1] transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-[#FFD54F]/80 via-[#ffecb3] to-[#e3f6f5] flex-shrink-0 overflow-hidden">
                {course.image ? (
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-medium text-[#272343]">
                  {course.title}
                </h3>
                <div className="mt-1 flex items-center justify-between gap-2 text-xs text-[#4b5563]">
                  <span>{course.rating?.toFixed(1)} · {course.enrollmentCount} học viên</span>
                  <span className="font-semibold text-[#272343]">
                    {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString()}đ`}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-3 text-center py-8">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-[#e5e7eb]" />
          <p className="text-sm text-[#6b7280]">
            Đang cập nhật các khóa học khác...
          </p>
        </div>
      )}
    </section>
  );
}