import { useNavigate } from "react-router-dom";
import {
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Lock,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SectionDetail = ({ section, courseId, completedItems, courseData }) => {
  const navigate = useNavigate();

  const getSectionProgress = () => {
    if (!section.items?.length) return 0;
    const completed = section.items.filter((i) =>
      completedItems.has(i.id)
    ).length;
    return Math.round((completed / section.items.length) * 100);
  };

  const getItemIcon = (item) => {
    if (item.kind === "Lesson") {
      return item.lessonType === "Video" ? (
        <PlayCircle className="w-6 h-6" />
      ) : (
        <FileText className="w-6 h-6" />
      );
    }
    return <HelpCircle className="w-6 h-6" />;
  };

  const getItemType = (item) => {
    if (item.kind === "Lesson") {
      return item.lessonType === "Video" ? "Video" : "Bài đọc";
    }
    return "Quiz";
  };

  const getItemDuration = (item) => {
    if (item.kind === "Lesson" && item.lessonType === "Video") {
      return "15 phút";
    }
    if (item.kind === "Lesson" && item.lessonType === "Text") {
      return "10 phút";
    }
    return "5 phút";
  };

  const progress = getSectionProgress();
  const completedCount = section.items.filter((i) =>
    completedItems.has(i.id)
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Compact Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(`/student/learn/${courseId}`)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Quay lại tổng quan</span>
          </button>

          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-[#FFD54F] text-gray-900 text-xs font-bold rounded-full">
                  Chương {section.orders}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {section.title}
              </h1>
            </div>

            {/* Check Line Progress */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Tiến độ</div>
                  <div className="text-lg font-bold text-gray-900">
                    {completedCount}/{section.items?.length || 0}
                  </div>
                </div>
                <div className="flex gap-1">
                  {section.items?.map((item, index) => (
                    <div
                      key={item.id}
                      className={cn(
                        "w-2 h-8 rounded-full transition-all duration-300",
                        completedItems.has(item.id)
                          ? "bg-gradient-to-b from-green-400 to-green-600 shadow-sm"
                          : "bg-gray-200"
                      )}
                      title={item.title}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-3">
          {section.items?.map((item, index) => {
            const isCompleted = completedItems.has(item.id);
            const isLocked = false;

            return (
              <button
                key={item.id}
                onClick={() =>
                  !isLocked &&
                  navigate(
                    `/student/learn/${courseId}/section/${section.id}/lesson/${item.id}`
                  )
                }
                disabled={isLocked}
                className={cn(
                  "w-full bg-white rounded-xl border-2 transition-all duration-300 text-left group shadow-sm hover:shadow-lg",
                  isCompleted
                    ? "border-green-200 hover:border-green-300"
                    : "border-gray-200 hover:border-[#FFD54F]",
                  isLocked && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="p-5">
                  <div className="flex items-center gap-5">
                    {/* Lesson Number/Status */}
                    <div
                      className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all shadow-md",
                        isCompleted
                          ? "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-green-200"
                          : isLocked
                          ? "bg-gray-200 text-gray-400"
                          : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 group-hover:from-[#FFD54F] group-hover:to-[#FFC107] group-hover:text-gray-900 group-hover:shadow-yellow-200"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : isLocked ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <span className="text-lg">{index + 1}</span>
                      )}
                    </div>

                    {/* Lesson Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#FFC107] transition-colors">
                            {item.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <span
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-full font-medium border",
                                item.kind === "Lesson" &&
                                  item.lessonType === "Video"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : item.kind === "Lesson"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-purple-50 text-purple-700 border-purple-200"
                              )}
                            >
                              {getItemIcon(item)}
                              <span>{getItemType(item)}</span>
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {isCompleted && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm font-semibold whitespace-nowrap shadow-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            Hoàn thành
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {(!section.items || section.items.length === 0) && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-16 text-center shadow-sm">
            <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Chưa có bài học
            </h3>
            <p className="text-gray-600">
              Chương này đang được cập nhật nội dung
            </p>
          </div>
        )}

        {/* Progress Summary */}
        {section.items && section.items.length > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-br from-[#FFF9E6] to-[#FFF3CD] rounded-2xl border-2 border-[#FFD54F]/30 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD54F] to-[#FFC107] flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <div className="text-sm text-gray-700 font-medium">
                    Tiến độ chương này
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {progress}% hoàn thành
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-700 mb-1">Đã học</div>
                <div className="text-3xl font-bold text-gray-900">
                  {completedCount}
                  <span className="text-lg text-gray-600">
                    /{section.items?.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionDetail;
