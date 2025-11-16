import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import VideoPlayer from "./VideoPlayer";
import TextLesson from "./TextLesson";
import QuizView from "./QuizView";
import CommentSection from "./CommentSection";

const LessonContent = ({
  item,
  section,
  onComplete,
  isCompleted,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}) => {
  const [videoProgress, setVideoProgress] = useState(0);

  const handleVideoComplete = () => {
    if (!isCompleted && videoProgress > 90) onComplete(item.id);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title & Meta */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                Chương {section.orders}
              </span>
              {item.kind === "Lesson" && (
                <span
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-full",
                    item.lessonType === "Video"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  )}
                >
                  {item.lessonType === "Video" ? "Video" : "Văn bản"}
                </span>
              )}
              {item.kind === "Quiz" && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  Quiz
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {item.title}
            </h1>
            {item.description && (
              <p className="text-gray-600">{item.description}</p>
            )}
          </div>
          {isCompleted && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg whitespace-nowrap">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Đã hoàn thành
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {item.kind === "Lesson" && item.lessonType === "Video" && (
          <div className="p-0">
            {item.assets?.[0]?.url ? (
              <VideoPlayer
                videoUrl={item.assets[0].url}
                onVideoEnd={handleVideoComplete}
                onProgress={setVideoProgress}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-gray-500">
                <AlertCircle className="w-16 h-16 mb-4" />
                <p>Video không khả dụng</p>
              </div>
            )}
          </div>
        )}

        {item.kind === "Lesson" && item.lessonType === "Text" && (
          <TextLesson
            content={item.assets?.[0]?.content || "Không có nội dung"}
            isCompleted={isCompleted}
            onComplete={() => onComplete(item.id)}
          />
        )}

        {item.kind === "Quiz" && (
          <QuizView
            quiz={item}
            isCompleted={isCompleted}
            onComplete={(passed) => passed && onComplete(item.id)}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" /> Trước đó
        </button>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-2 px-6 py-3 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Tiếp theo <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Comments (only for video) */}
      {item.kind === "Lesson" && item.lessonType === "Video" && (
        <CommentSection courseId={item.courseId} itemId={item.id} />
      )}
    </div>
  );
};

export default LessonContent;
