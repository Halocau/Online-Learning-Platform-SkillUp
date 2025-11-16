import { useState, useEffect } from "react";
import { CheckCircle2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const TextLesson = ({ content, onComplete, isCompleted }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [readTime, setReadTime] = useState(0);

  useEffect(() => {
    // Calculate estimated read time (average 200 words per minute)
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    setReadTime(minutes);
  }, [content]);

  const handleScroll = (e) => {
    const element = e.target;
    const isBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50;

    if (isBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleMarkComplete = () => {
    if (!isCompleted) {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col">
      {/* Reading Info Bar */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BookOpen className="w-4 h-4" />
          <span>Thời gian đọc ước tính: {readTime} phút</span>
        </div>

        {!isCompleted && hasScrolledToBottom && (
          <button
            onClick={handleMarkComplete}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-medium rounded-lg transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Đánh dấu hoàn thành
          </button>
        )}
      </div>

      {/* Text Content */}
      <div
        className="px-8 py-8 prose prose-lg max-w-none overflow-y-auto max-h-[600px] custom-scrollbar"
        onScroll={handleScroll}
      >
        <div
          className="text-gray-800 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Complete Indicator */}
      {!hasScrolledToBottom && !isCompleted && (
        <div className="px-6 py-4 bg-blue-50 border-t border-blue-100 text-center">
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ffd54f;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ffc107;
        }
      `}</style>
    </div>
  );
};

export default TextLesson;