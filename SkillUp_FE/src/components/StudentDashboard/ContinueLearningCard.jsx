import { memo } from "react";
import { Link } from "react-router-dom";
import { PlayCircle } from "lucide-react";

const ContinueLearningCard = memo(({ course }) => {
    return (
        <Link
            to={`/student/learn/${course.id}`}
            className="group flex items-center gap-4 p-3 md:p-4 border border-gray-200 rounded-2xl hover:shadow-lg hover:border-[#FFD54F] transition-all min-h-[120px] w-full h-full"
        >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50">
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
                            style={{ width: `${course.progressPercentage || 0}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {course.progressPercentage?.toFixed(0) || 0}% hoàn thành
                        {course.completedItems !== undefined && course.totalItems !== undefined && (
                            <span className="ml-1">({course.completedItems}/{course.totalItems})</span>
                        )}
                    </p>
                </div>
            </div>
            <PlayCircle className="w-5 h-5 text-[#FFD54F] flex-shrink-0 opacity-80 group-hover:opacity-100" />
        </Link>
    );
});

ContinueLearningCard.displayName = "ContinueLearningCard";

export default ContinueLearningCard;

