import { useState, useEffect } from "react";
import { CheckCircle2, Clock } from "lucide-react";

const TextLesson = ({ content, onComplete, isCompleted }) => {
  const [readTime, setReadTime] = useState(0);

  useEffect(() => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    setReadTime(minutes);
  }, [content]);

  const handleMarkComplete = () => {
    if (!isCompleted) {
      onComplete();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div
        className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Complete Button at Bottom */}
      {!isCompleted && (
        <div className="mt-12 pt-6 border-t border-gray-200 flex justify-center">
          <button
            onClick={handleMarkComplete}
            className="flex items-center gap-2 px-6 py-3 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-medium rounded-lg transition-all transform hover:scale-105"
          >
            <CheckCircle2 className="w-5 h-5" />
            Đánh dấu hoàn thành
          </button>
        </div>
      )}
    </div>
  );
};

export default TextLesson;
