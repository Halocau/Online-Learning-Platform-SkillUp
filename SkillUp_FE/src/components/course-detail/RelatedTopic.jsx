// src/components/course-detail/RelatedTopicsSection.jsx
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Tags, ArrowRight } from "lucide-react";

export default function RelatedTopicsSection({
  categoryName,
  subCategoryName,
  categoryId,
  subCategoryId,
}) {
  return (
    <Card className="border border-[#e5e7eb] bg-[#fffffe] rounded-2xl overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-[#FFD54F]/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Tags className="w-4 h-4 text-[#FFD54F]" />
          </div>
          <h2 className="text-sm font-semibold tracking-tight text-[#272343]">
            Khám phá chủ đề liên quan
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            to={`/courses/${categoryId}`}
            className="group p-4 bg-gradient-to-br from-[#FFD54F]/10 to-[#ffecb3]/20 rounded-xl border border-[#e5e7eb] hover:border-[#FFD54F]/50 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#272343]">
                {categoryName}
              </h3>
              <ArrowRight className="w-4 h-4 text-[#FFD54F] group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </div>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              Khám phá thêm các khóa học tương tự về {categoryName}
            </p>
          </Link>

          <Link
            to={`/courses/${categoryId}/?subcategory=${subCategoryId}`}
            className="group p-4 bg-gradient-to-br from-[#e3f6f5] to-[#bae8e8]/40 rounded-xl border border-[#e5e7eb] hover:border-[#bae8e8] transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#272343]">
                {subCategoryName}
              </h3>
              <ArrowRight className="w-4 h-4 text-[#2d334a] group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </div>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              Xem các khóa học tương tự trong {subCategoryName}
            </p>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}