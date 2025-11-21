// src/components/home/CourseCard.jsx
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import StarRating from "@/components/ui/StarRating";

export default function CourseCard({ course }) {
  return (
    <Link to={`/course/${course.id}`}>
      <Card className="group h-full overflow-hidden rounded-2xl border border-[#272343]/15 bg-[#fffffe] shadow-sm transition-all duration-300 hover:shadow-[0_18px_60px_rgba(39,35,67,0.12)] hover:-translate-y-1">
        <div className="aspect-video overflow-hidden bg-[#e3f6f5]">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-base leading-snug line-clamp-2 text-[#272343] group-hover:text-[#FFD54F] transition-colors tracking-tight">
            {course.title}
          </h3>
          <p className="text-sm text-[#2d334a] font-medium">{course.lecturerName}</p>
          <div className="flex items-center gap-1">
            <StarRating rating={course.rating} />
          </div>
          <div className="flex items-center justify-between text-sm pt-2 border-t border-[#272343]/10">
            <div className="flex items-center gap-1 text-[#2d334a]">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">{course.enrollmentCount}</span>
            </div>
            {course.price === 0 ? (
              <span className="font-bold text-green-600 text-sm">Miễn phí</span>
            ) : (
              <span className="font-bold text-[#272343] text-sm">
                ₫{course.price.toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}