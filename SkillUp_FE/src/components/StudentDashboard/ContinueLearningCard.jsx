import { memo } from "react";
import { Link } from "react-router-dom";
import { PlayCircle } from "lucide-react";

const ContinueLearningCard = memo(({ course }) => {
    return (
        <Link
            to={`/course/${course.id}`}
            className="group flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-[#FFD54F] transition-all"
        >
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = "https://via.placeholder.com/64x64?text=No+Image";
                    }}
                />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-[#FFD54F] transition-colors">
                    {course.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                    {course.lecturerName}
                </p>
                <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                            className="bg-[#FFD54F] h-1.5 rounded-full"
                            style={{ width: "30%" }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">30% hoàn thành</p>
                </div>
            </div>
            <PlayCircle className="w-6 h-6 text-[#FFD54F] flex-shrink-0" />
        </Link>
    );
});

ContinueLearningCard.displayName = "ContinueLearningCard";

export default ContinueLearningCard;

