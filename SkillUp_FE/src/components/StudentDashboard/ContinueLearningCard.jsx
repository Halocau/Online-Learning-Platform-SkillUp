import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle, Loader2 } from "lucide-react";
import { courseAPI } from "@/api/courseAPI";

const ContinueLearningCard = memo(({ course }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        
        try {
            const response = await courseAPI.getResumeItem(course.id);
            
            if (response.data?.code === 200 && response.data?.data?.[0]) {
                const resumeData = response.data.data[0];
                const { itemId } = resumeData;
                
                const courseDetail = await courseAPI.getCourseDetail(course.id);
                const courseData = courseDetail.data.data[0];
                
                let sectionId = null;
                for (const section of courseData.sections) {
                    const item = section.items?.find(i => i.id === itemId);
                    if (item) {
                        sectionId = section.id;
                        break;
                    }
                }
                
                if (sectionId) {
                    navigate(`/student/learn/${course.id}/section/${sectionId}/lesson/${itemId}`);
                } else {
                    navigate(`/student/learn/${course.id}`);
                }
            } else {
                navigate(`/student/learn/${course.id}`);
            }
        } catch (error) {
            console.error("Error getting resume item:", error);
            navigate(`/student/learn/${course.id}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="group flex items-center gap-4 p-3 md:p-4 border border-gray-200 rounded-2xl hover:shadow-lg hover:border-[#FFD54F] transition-all min-h-[120px] w-full h-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
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
            {loading ? (
                <Loader2 className="w-5 h-5 text-[#FFD54F] flex-shrink-0 animate-spin" />
            ) : (
                <PlayCircle className="w-5 h-5 text-[#FFD54F] flex-shrink-0 opacity-80 group-hover:opacity-100" />
            )}
        </button>
    );
});

ContinueLearningCard.displayName = "ContinueLearningCard";

export default ContinueLearningCard;

