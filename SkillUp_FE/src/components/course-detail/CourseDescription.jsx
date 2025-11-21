// src/components/course-detail/CourseDescriptionSection.jsx
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Rocket, Layers } from "lucide-react";

export default function CourseDescriptionSection({ description }) {
  return (
    <section aria-labelledby="course-description">
      <h2 id="course-description" className="text-xl sm:text-2xl font-semibold tracking-tight text-[#272343]">
        Mô tả khóa học
      </h2>
      <div className="mt-3 space-y-3 text-base text-[#2d334a]">
        <p className="leading-relaxed whitespace-pre-wrap">
          {description || "Khóa học này được thiết kế cho người mới bắt đầu đến những bạn muốn hệ thống lại kiến thức. Bạn sẽ đi từ những khái niệm nền tảng cho tới cách tổ chức dự án thực tế, tối ưu hiệu năng và trải nghiệm người dùng."}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-2xl border border-[#e5e7eb] bg-[#fdfaf1] p-3">
          <Rocket className="mt-0.5 h-4 w-4 text-[#272343] flex-shrink-0" />
          <div>
            <div className="text-sm font-medium text-[#272343]">
              Kết quả sau khóa học
            </div>
            <p className="mt-1 text-sm text-[#4b5563]">
              Tự xây dựng và triển khai các dự án thực tế, sẵn sàng cho công việc.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-[#e5e7eb] bg-[#e3f6f5] p-3">
          <Layers className="mt-0.5 h-4 w-4 text-[#272343] flex-shrink-0" />
          <div>
            <div className="text-sm font-medium text-[#272343]">
              Học qua dự án thực tế
            </div>
            <p className="mt-1 text-sm text-[#4b5563]">
              Nhiều bài tập thực hành và dự án đầy đủ quy trình.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}