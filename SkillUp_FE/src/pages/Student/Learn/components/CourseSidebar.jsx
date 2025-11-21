import { useNavigate } from "react-router-dom";
import {
  PlayCircle,
  FileText,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CourseSidebar = ({
  courseData,
  currentItem,
  currentSection,
  completedItems,
  onItemSelect,
  courseId,
  progress,
}) => {
  const navigate = useNavigate();

  const getItemIcon = (item) => {
    if (completedItems.has(item.id)) {
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    }
    if (item.kind === "Lesson") {
      return item.lessonType === "Video" ? (
        <PlayCircle className="w-4 h-4 text-gray-400" />
      ) : (
        <FileText className="w-4 h-4 text-gray-400" />
      );
    }
    return <HelpCircle className="w-4 h-4 text-gray-400" />;
  };

  const getSectionProgress = () => {
    if (!currentSection?.items?.length) return 0;
    const completed = currentSection.items.filter((i) =>
      completedItems.has(i.id)
    ).length;
    return Math.round((completed / currentSection.items.length) * 100);
  };

  const sectionProgress = getSectionProgress();

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-4 py-5 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white">
        <button
          onClick={() => navigate(`/student/learn/${courseId}`)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Tổng quan khóa học</span>
        </button>

        <button
          onClick={() =>
            navigate(`/student/learn/${courseId}/section/${currentSection.id}`)
          }
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 mb-3 transition-colors group w-full"
        >
          <span className="flex-1 text-left">Quay lại danh sách bài học</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <h2 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2">
          {currentSection?.title}
        </h2>

        {/* Section Progress */}
        {sectionProgress > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
              <span className="font-medium">{sectionProgress}% hoàn thành</span>
              <span className="text-gray-500">
                {
                  currentSection.items.filter((i) => completedItems.has(i.id))
                    .length
                }
                /{currentSection.items?.length}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  sectionProgress === 100
                    ? "bg-gradient-to-r from-green-400 to-green-600"
                    : "bg-gradient-to-r from-[#FFD54F] to-[#FFC107]"
                )}
                style={{ width: `${sectionProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Current Section Lessons Only */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wide">
            Bài học trong chương này
          </div>
          {currentSection?.items?.map((item, index) => {
            const isCompleted = completedItems.has(item.id);
            const isCurrent = currentItem?.id === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onItemSelect(item, currentSection)}
                className={cn(
                  "w-full p-3 rounded-lg flex items-start gap-3 text-left transition-all group mb-1",
                  isCurrent
                    ? "bg-gradient-to-r from-[#FFF9E6] to-[#FFF3CD] border-l-3 border-[#FFD54F] shadow-sm"
                    : "hover:bg-gray-50 border-l-3 border-transparent"
                )}
              >
                {/* Lesson Number Badge */}
                <div
                  className={cn(
                    "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-[#FFD54F] text-gray-900"
                      : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getItemIcon(item)}
                    <span
                      className={cn(
                        "text-xs font-medium",
                        item.kind === "Lesson"
                          ? item.lessonType === "Video"
                            ? "text-blue-600"
                            : "text-green-600"
                          : "text-purple-600"
                      )}
                    >
                      {item.kind === "Lesson"
                        ? item.lessonType === "Video"
                          ? "Video"
                          : "Văn bản"
                        : "Quiz"}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-sm line-clamp-2 block",
                      isCurrent
                        ? "text-gray-900 font-semibold"
                        : "text-gray-700 group-hover:text-gray-900"
                    )}
                  >
                    {item.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer with Course Progress */}
      <div className="px-4 py-4 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
        <div className="text-xs text-gray-600 mb-2">Tiến độ khóa học</div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FFD54F] to-[#FFC107] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseSidebar;
