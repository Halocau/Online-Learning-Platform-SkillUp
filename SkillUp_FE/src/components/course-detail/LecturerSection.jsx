// src/components/course-detail/LecturerSection.jsx
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Users, PlayCircle, GraduationCap } from "lucide-react";

export default function LecturerSection({ lecturer, rating, enrollmentCount }) {
  return (
    <section aria-labelledby="lecturer-section">
      <h2 id="lecturer-section" className="text-xl sm:text-2xl font-semibold tracking-tight text-[#272343]">
        Giảng viên
      </h2>
      <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-[#e5e7eb] bg-[#fffffe] p-4 sm:flex-row sm:p-5">
        <div className="flex items-center sm:block">
          <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-[#FFD54F] via-[#ffecb3] to-[#e3f6f5] ring-2 ring-[#fffffe] shadow-sm overflow-hidden">
            {lecturer.avartar ? (
              <img src={lecturer.avartar} alt={lecturer.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#272343]">
                {lecturer.fullName.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-1 flex-1">
          <div className="text-base font-semibold tracking-tight text-[#272343]">
            {lecturer.fullName}
          </div>
          <div className="text-sm text-[#6b7280]">
            {lecturer.profession || "Frontend Engineer · 8+ năm kinh nghiệm"}
          </div>
          <div className="mt-2 grid gap-3 text-xs text-[#4b5563] sm:grid-cols-3">
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-[#FFD54F] fill-[#FFD54F]" />
              <span>{rating.toFixed(1)} đánh giá trung bình</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[#272343]" />
              <span>{enrollmentCount.toLocaleString()}+ học viên</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PlayCircle className="h-3.5 w-3.5 text-[#272343]" />
              <span>Nhiều khóa học trên StudyTrack</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-[#2d334a]">
            {lecturer.bio || "Giảng viên nhiều kinh nghiệm, tập trung vào việc xây dựng nội dung chất lượng, dễ hiểu và thân thiện với người học mới."}
          </p>
        </div>
      </div>
    </section>
  );
}