// src/components/course-detail/MoreCoursesByLecturerSection.jsx
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, BookOpen } from "lucide-react";

export default function MoreCoursesByLecturerSection({ lecturerName }) {
  return (
    <Card className="border-2 border-[#FFD54F]/20">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#FFD54F]/20 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-[#FFD54F]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Các khóa học khác của {lecturerName}
          </h2>
        </div>
        
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 mb-2">Đang tải các khóa học khác...</p>
          <p className="text-sm text-gray-500">
            Giảng viên này có nhiều khóa học chất lượng khác
          </p>
        </div>
      </CardContent>
    </Card>
  );
}