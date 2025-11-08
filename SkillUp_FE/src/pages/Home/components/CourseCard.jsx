// src/components/home/CourseCard.jsx
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import StarRating from "@/components/ui/StarRating";

export default function CourseCard({ course }) {
  return (
    <Link to={`/course/${course.id}`}>
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200">
        <div className="aspect-video overflow-hidden bg-gray-100">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-base line-clamp-2 group-hover:text-[#FFD54F] transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600">{course.lecturerName}</p>
          <div className="flex items-center gap-1">
            <StarRating rating={course.rating} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> {course.enrollmentCount}
              </span>
            </div>
            {course.price === 0 ? (
              <span className="font-bold text-green-600">Miễn phí</span>
            ) : (
              <span className="font-bold">₫{course.price.toLocaleString()}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}