// src/components/course-detail/CourseCurriculumSection.jsx
import { Card, CardContent } from "@/components/ui/card";
import {
  PlayCircle,
  FileText,
  BookOpen,
  ChevronDown,
  Lock,
  Unlock,
  Eye,
  ClipboardList,
  Clock,
  Target,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import VideoPreviewModal from "./VideoPreviewModal";

export default function CourseCurriculumSection({ sections }) {
  const [previewLesson, setPreviewLesson] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (lesson) => {
    setPreviewLesson(lesson);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    // Small delay before clearing lesson to prevent flickering
    setTimeout(() => setPreviewLesson(null), 300);
  };

  if (!sections || sections.length === 0) {
    return (
      <Card className="border-2 border-[#FFD54F]/20">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FFD54F]/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#FFD54F]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Nội dung khóa học
            </h2>
          </div>
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Nội dung khóa học sẽ được cập nhật sớm</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Count lessons and quizzes separately
  const counts = sections.reduce(
    (acc, s) => {
      s.items?.forEach((item) => {
        if (item.kind === "Lesson") acc.lessons++;
        else if (item.kind === "Quiz") acc.quizzes++;
      });
      return acc;
    },
    { lessons: 0, quizzes: 0 }
  );

  return (
    <>
      <Card className="border-2 border-[#FFD54F]/20">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#FFD54F]/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#FFD54F]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Nội dung khóa học
            </h2>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-600 bg-[#FFD54F]/10 px-4 py-3 rounded-lg">
            <span className="font-semibold">{sections.length} chương</span>
            <span>•</span>
            <span className="font-semibold">{counts.lessons} bài học</span>
            {counts.quizzes > 0 && (
              <>
                <span>•</span>
                <span className="font-semibold">
                  {counts.quizzes} bài kiểm tra
                </span>
              </>
            )}
          </div>

          <div className="space-y-3">
            {sections.map((section, idx) => (
              <SectionAccordion
                key={section.id}
                section={section}
                index={idx}
                onPreview={handlePreview}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        lesson={previewLesson}
      />
    </>
  );
}

function SectionAccordion({ section, index, onPreview }) {
  const [isOpen, setIsOpen] = useState(index === 0); // First section open by default

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#FFD54F]/50 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4 text-left flex-1">
          <div className="w-8 h-8 bg-[#FFD54F]/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-sm text-gray-900">{index + 1}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {section.title || `Chương ${index + 1}`}
            </h3>
            {section.description && (
              <p className="text-sm text-gray-500 mt-1">
                {section.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
          <span className="text-sm text-gray-500 font-medium">
            {section.items?.length || 0} nội dung
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 bg-gray-50/50 space-y-2">
          {section.items && section.items.length > 0 ? (
            section.items.map((item, itemIdx) =>
              item.kind === "Lesson" ? (
                <LessonItem
                  key={item.id}
                  lesson={item}
                  index={itemIdx}
                  onPreview={onPreview}
                />
              ) : item.kind === "Quiz" ? (
                <QuizItem key={item.id} quiz={item} index={itemIdx} />
              ) : null
            )
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm">
              Chương này chưa có nội dung
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LessonItem({ lesson, index, onPreview }) {
  const isVideo = lesson.lessonType === "Video";
  const isFree = lesson.isFree;
  const canPreview = isFree && isVideo;

  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-white rounded-lg border border-gray-200 hover:border-[#FFD54F]/50 transition-all group">
      {/* Lesson Icon based on type */}
      <div className="flex-shrink-0">
        {isVideo ? (
          <PlayCircle className="w-5 h-5 text-[#FFD54F]" />
        ) : (
          <FileText className="w-5 h-5 text-purple-500" />
        )}
      </div>

      {/* Lesson Order */}
      <span className="text-xs font-bold text-gray-400 w-8 flex-shrink-0">
        {lesson.orders}
      </span>

      {/* Lesson Title */}
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium line-clamp-1">
          {lesson.title}
        </span>
      </div>

      {/* Lesson Type Badge */}
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
          isVideo
            ? "bg-[#FFD54F]/20 text-gray-700"
            : "bg-purple-100 text-purple-700"
        }`}
      >
        {isVideo ? "Video" : "Bài viết"}
      </span>

      {/* Free/Locked Badge or Preview Button */}
      {isFree ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
            <Unlock className="w-4 h-4" />
            <span>Miễn phí</span>
          </div>

          {/* Preview Button - Only show for free video lessons */}
          {canPreview && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPreview(lesson);
              }}
              size="sm"
              className="bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-semibold px-3 py-1 h-auto text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              Xem trước
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
          <Lock className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

function QuizItem({ quiz, index }) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-white rounded-lg border border-gray-200 hover:border-blue-200 transition-all group">
      {/* Quiz Icon */}
      <div className="flex-shrink-0">
        <ClipboardList className="w-5 h-5 text-blue-500" />
      </div>

      {/* Quiz Order */}
      <span className="text-xs font-bold text-gray-400 w-8 flex-shrink-0">
        {quiz.orders}
      </span>

      {/* Quiz Title */}
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium line-clamp-1">
          {quiz.title}
        </span>
        {quiz.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
            {quiz.description}
          </p>
        )}
      </div>

      {/* Quiz Info */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Timer */}
        {quiz.timer && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{quiz.timer} phút</span>
          </div>
        )}

        {/* Pass Percent */}
        {quiz.passPercent && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Target className="w-3.5 h-3.5" />
            <span>{quiz.passPercent}%</span>
          </div>
        )}

        {/* Quiz Badge */}
        <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
          Kiểm tra
        </span>
      </div>

      {/* Locked Icon for Quizzes (assuming quizzes are not free) */}
      <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
        <Lock className="w-4 h-4" />
      </div>
    </div>
  );
}
