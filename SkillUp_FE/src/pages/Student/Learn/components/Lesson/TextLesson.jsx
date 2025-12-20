import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";


const TextLesson = ({ content, onComplete, isCompleted, lessonId }) => {
  const [readTime, setReadTime] = useState(0);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    setReadTime(minutes);
  }, [content]);

  const handleMarkComplete = async () => {
    if (isCompleted || marking) return;
    
    setMarking(true);
    try {
      await onComplete();
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div
        className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Complete Button at Bottom */}
      {! isCompleted && (
        <div className="mt-12 pt-6 border-t border-gray-200 flex justify-center">
          <button
            onClick={handleMarkComplete}
            disabled={marking}
            className="flex items-center gap-2 px-6 py-3 bg-[#FFD54F] hover: bg-[#FFC107] text-gray-900 font-medium rounded-lg transition-all transform hover:scale-105 disabled: opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {marking ?  (
              <>
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Đánh dấu hoàn thành
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default TextLesson;