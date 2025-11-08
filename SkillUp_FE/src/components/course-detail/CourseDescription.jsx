// src/components/course-detail/CourseDescriptionSection.jsx
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function CourseDescriptionSection({ description }) {
  return (
    <Card className="border-2 border-[#FFD54F]/20">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#FFD54F]/20 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-[#FFD54F]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Mô tả khóa học</h2>
        </div>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}