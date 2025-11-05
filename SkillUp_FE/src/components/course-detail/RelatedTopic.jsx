// src/components/course-detail/RelatedTopicsSection.jsx
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Tags, ArrowRight } from "lucide-react";

export default function RelatedTopicsSection({
  categoryName,
  subCategoryName,
}) {
  return (
    <Card className="border-2 border-[#FFD54F]/20">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#FFD54F]/20 rounded-lg flex items-center justify-center">
            <Tags className="w-6 h-6 text-[#FFD54F]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Khám phá chủ đề liên quan
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to={`/category/${categoryName}`}
            className="group p-6 bg-gradient-to-br from-[#FFD54F]/10 to-[#FFC107]/10 rounded-xl border-2 border-[#FFD54F]/20 hover:border-[#FFD54F] transition-all hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900">
                {categoryName}
              </h3>
              <ArrowRight className="w-5 h-5 text-[#FFD54F] group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-sm text-gray-600">
              Khám phá thêm các khóa học tượng về {categoryName}
            </p>
          </Link>

          <Link
            to={`/subcategory/${subCategoryName}`}
            className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900">
                {subCategoryName}
              </h3>
              <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-sm text-gray-600">
              Xem các khóa học tương tự trong {subCategoryName}
            </p>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
