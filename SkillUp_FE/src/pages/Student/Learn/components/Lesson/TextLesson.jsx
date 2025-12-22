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
    </div>
  );
};

export default TextLesson;
