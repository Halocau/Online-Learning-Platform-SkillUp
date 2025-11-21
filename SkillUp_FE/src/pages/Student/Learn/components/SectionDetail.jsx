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
        <PlayCircle className="w-4 h-4" />
      ) : (
        <FileText className="w-4 h-4" />
      );
    }
    return <HelpCircle className="w-4 h-4" />;
  };

  const getItemType = (item) => {
    if (item.kind === "Lesson") {
      return item.lessonType === "Video" ? "Video" : "Bài đọc";
    }
    return "Quiz";
  };

  const getItemColor = (item) => {
    if (item.kind === "Lesson" && item.lessonType === "Video") {
      return "sky";
    }
    if (item.kind === "Lesson" && item.lessonType === "Text") {
      return "amber";
    }
    return "violet";
  };

  const progress = getSectionProgress();
  const completedCount = section.items.filter((i) =>
    completedItems.has(i.id)
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <button
                  onClick={() => navigate(`/student/learn/${courseId}`)}
                  className="mb-3 inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-[0.7rem] font-medium text-gray-600 ring-1 ring-gray-200 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Quay lại tổng quan
                </button>
                <h2 className="mt-2 text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
                  Chương {section.orders} · {section.title}
                </h2>
                <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                  Hoàn thành lần lượt từng bài dưới đây để nắm chắc nền tảng.
                </p>
              </div>

              {/* Vertical Progress Bars */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-[0.7rem] font-medium text-gray-500">
                  Tiến độ chương
                </span>
                <span className="text-lg font-semibold tracking-tight text-emerald-600">
                  {completedCount}/{section.items?.length || 0}
                </span>
                <div className="mt-1 flex gap-1">
                  {section.items?.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "h-6 w-1 rounded-full transition-all duration-300",
                        completedItems.has(item.id)
                          ? "bg-gradient-to-b from-emerald-400 to-emerald-500"
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

      {/* Lesson List */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="space-y-3">
          {section.items?.map((item, index) => {
            const isCompleted = completedItems.has(item.id);
            const isLocked = false;
            const color = getItemColor(item);

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
                  "group flex w-full items-stretch gap-3 rounded-2xl border-2 p-3 text-left shadow-sm transition-all duration-300",
                  isCompleted
                    ? "border-emerald-400/30 bg-emerald-500/5 hover:border-emerald-300 hover:bg-emerald-500/10 hover:shadow-md"
                    : isLocked
                    ? "border-gray-200 bg-gray-50/60 opacity-70"
                    : "border-gray-200 bg-white hover:border-[#FFD54F]/40 hover:bg-[#FFD54F]/5 hover:shadow-lg"
                )}
              >
                {/* Index / Status Badge */}
                <div
                  className={cn(
                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xs font-semibold tracking-tight ring-1 transition-all shadow-sm",
                    isCompleted
                      ? "bg-emerald-500/20 text-emerald-700 ring-emerald-400/60"
                      : isLocked
                      ? "bg-gray-200 text-gray-400 ring-gray-300"
                      : "bg-gray-50 text-gray-700 ring-gray-200 group-hover:bg-[#FFD54F]/20 group-hover:text-[#B8860B] group-hover:ring-[#FFD54F]/60"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : isLocked ? (
                    <Lock className="h-3.5 w-3.5 text-gray-500" />
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>

                {/* Lesson Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="truncate text-sm font-semibold tracking-tight text-gray-900 transition-colors group-hover:text-[#FFC107] sm:text-base">
                      {item.title}
                    </h3>
                    {isCompleted && (
                      <span className="hidden text-[0.7rem] font-medium text-emerald-600 sm:inline">
                        Hoàn thành
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-gray-600">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-1 ring-1",
                        color === "sky" &&
                          "bg-sky-50 text-sky-700 ring-sky-200",
                        color === "amber" &&
                          "bg-amber-50 text-amber-700 ring-amber-200",
                        color === "violet" &&
                          "bg-violet-50 text-violet-700 ring-violet-200"
                      )}
                    >
                      {getItemIcon(item)}
                      <span>{getItemType(item)}</span>
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {(!section.items || section.items.length === 0) && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-gray-200 bg-white p-16 text-center shadow-sm">
            <FileText className="mx-auto mb-4 h-20 w-20 text-gray-300" />
            <h3 className="mb-2 text-2xl font-bold text-gray-900">
              Chưa có bài học
            </h3>
            <p className="text-gray-600">
              Chương này đang được cập nhật nội dung
            </p>
          </div>
        )}

        {/* Section Progress Summary */}
        {section.items && section.items.length > 0 && (
          <div className="mt-8 rounded-2xl border-2 border-[#FFD54F]/20 bg-gradient-to-br from-[#FFF9E6] via-[#FFF9E6]/50 to-white p-4 shadow-lg sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFD54F]/30 text-[#B8860B] ring-1 ring-[#FFD54F]/60 sm:h-12 sm:w-12">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <div className="text-[0.7rem] font-semibold uppercase tracking-tight text-[#B8860B]/80 sm:text-xs">
                    Tiến độ chương này
                  </div>
                  <div className="mt-1 text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                    {progress}% hoàn thành
                  </div>
                  <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                    {completedCount === section.items.length
                      ? "Xuất sắc! Bạn đã hoàn thành toàn bộ chương này."
                      : `Chỉ còn ${
                          section.items.length - completedCount
                        } bài nữa, bạn sẽ hoàn thành toàn bộ chương này.`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[0.7rem] text-gray-600">Đã học</div>
                <div className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                  {completedCount}
                  <span className="text-sm text-gray-600 sm:text-lg">
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
