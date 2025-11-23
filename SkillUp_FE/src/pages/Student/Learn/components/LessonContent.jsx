import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Check,
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
  lessonId,
}) => {
  const [videoProgress, setVideoProgress] = useState(0);
  const [marking, setMarking] = useState(false);

  const handleVideoComplete = () => {
    if (!isCompleted && videoProgress > 90) {
      handleMarkComplete();
    }
  };

  const handleMarkComplete = async () => {
    if (isCompleted || marking) return;
    
    setMarking(true);
    try {
      await onComplete(item.id);
    } finally {
      setMarking(false);
    }
  };

  const pdfAssets =
    item.assets?.filter(
      (asset) => asset.type === "PDF" || asset.url?.endsWith(".pdf")
    ) || [];

  return (
    <div className="w-full bg-gray-50 min-h-full">
      {/* Minimal Title Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500">
                  Chương {section.orders}
                </span>
                <span className="text-gray-300">•</span>
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium",
                    item.kind === "Lesson"
                      ? item.lessonType === "Video"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                      : "bg-purple-100 text-purple-700"
                  )}
                >
                  {item.kind === "Lesson"
                    ? item.lessonType === "Video"
                      ? "Video"
                      : "Văn bản"
                    : "Quiz"}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {item.title}
              </h1>


              {/* PDF Downloads */}
              {pdfAssets.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {pdfAssets.map((asset, index) => (
                    <a
                      key={index}
                      href={asset.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors text-sm font-medium"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>
                        Tải tài liệu {pdfAssets.length > 1 ? index + 1 : ""}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {isCompleted && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 whitespace-nowrap">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Đã hoàn thành</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {item.kind === "Lesson" && item.lessonType === "Video" && (
          <div className="mb-8">
            {item.assets?.[0]?.url ? (
              <>
                <VideoPlayer
                  videoUrl={item.assets[0].url}
                  onVideoEnd={handleVideoComplete}
                  onProgress={setVideoProgress}
                />

                {/* Description and Document Section */}
                {(item.description || item.assets[0].fileUrl) && (
                  <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    {/* Description */}
                    {item.description && (
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Mô tả bài học
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    )}

                    {/* PDF Document */}
                    {item.assets[0].fileUrl && (
                      <div className={item.description ? "pt-4 border-t border-gray-200" : ""}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Tài liệu
                        </h3>
                        <a
                          href={item.assets[0].fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors font-medium"
                        >
                          <FileDown className="w-5 h-5" />
                          <span>Tải tài liệu PDF</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
                <AlertCircle className="w-12 h-12 mb-3" />
                <p>Video không khả dụng</p>
              </div>
            )}
          </div>
        )}

        {item.kind === "Lesson" && item.lessonType === "Text" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <TextLesson
              content={item.assets?.[0]?.content || "Không có nội dung"}
              isCompleted={isCompleted}
              onComplete={() => onComplete(item.id)}
            />
          </div>
        )}

        {item.kind === "Quiz" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <QuizView
              quiz={item}
              isCompleted={isCompleted}
              onComplete={(passed) => passed && onComplete(item.id)}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="flex items-center gap-2 px-6 py-3 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-white border border-gray-200 hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-200 shadow-sm hover:shadow"
          >
            <ChevronLeft className="w-5 h-5" /> Bài trước
          </button>

          <div className="flex items-center gap-3">
            {/* Mark Complete Button - Only for Video Lessons */}
            {item.kind === "Lesson" && item.lessonType === "Video" && !isCompleted && (
              <button
                onClick={handleMarkComplete}
                disabled={marking}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {marking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Đánh dấu hoàn thành
                  </>
                )}
              </button>
            )}

            <button
              onClick={onNext}
              disabled={!hasNext}
              className="flex items-center gap-2 px-6 py-3 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              Tiếp theo <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {item.kind === "Lesson" && item.lessonType === "Video" && (
          <div className="mt-8">
            <CommentSection lessonId={lessonId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonContent;
