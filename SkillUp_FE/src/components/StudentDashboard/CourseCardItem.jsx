import { memo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CourseCardItem = memo(({ course, index }) => {
    const navigate = useNavigate();

    const handleLearnClick = useCallback((e) => {
        e.preventDefault();
        navigate(`/student/learn/${course.id}`);
    }, [navigate, course.id]);

    return (
        <div
            className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-[#FFD54F] transition-all duration-300 bg-white course-slide flex flex-col"
            style={{
                animationDelay: `${index * 0.05}s`,
                maxHeight: '100%'
            }}
        >
            <Link to={`/student/learn/${course.id}`} className="flex flex-col">
                <div className="aspect-video overflow-hidden bg-gray-100 relative flex-shrink-0">
                    <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/400x225?text=No+Image";
                        }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>
                <div className="p-3 flex flex-col">
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-[#FFD54F] transition-colors mb-1.5 h-10 flex items-start">
                        {course.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-1 h-5 flex items-center">
                        {course.lecturerName}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                            {course.enrollmentCount || 0} học viên
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs hover:bg-[#FFD54F]/10 hover:text-[#FFD54F] flex-shrink-0"
                            onClick={handleLearnClick}
                        >
                            Học ngay
                            <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                    </div>
                </div>
            </Link>
        </div>
    );
});

CourseCardItem.displayName = "CourseCardItem";

export default CourseCardItem;

