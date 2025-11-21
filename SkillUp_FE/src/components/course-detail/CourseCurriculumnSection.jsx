// src/components/course-detail/CourseCurriculumSection.jsx
import {
  BookOpen,
  PlayCircle,
  FileText,
  ChevronDown,
  Lock,
  Unlock,
  Eye,
  Clock,
  Target,
  HelpCircle,
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
    setTimeout(() => setPreviewLesson(null), 300);
  };

  if (!sections || sections.length === 0) {
    return (
      <section aria-labelledby="course-curriculum">
        <h2
          id="course-curriculum"
          className="text-xl sm:text-2xl font-semibold tracking-tight text-[#272343]"
        >
          Nội dung khóa học
        </h2>
        <div className="mt-4 text-center py-12 rounded-2xl border border-[#e5e7eb] bg-[#fffffe]">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-[#e5e7eb]" />
          <p className="text-sm text-[#6b7280]">
            Nội dung khóa học sẽ được cập nhật sớm
          </p>
        </div>
      </section>
    );
  }

  // Count lessons and quizzes
  const stats = sections.reduce(
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
      <section aria-labelledby="course-curriculum">
        <div className="flex items-center justify-between gap-2">
          <h2
            id="course-curriculum"
            className="text-xl sm:text-2xl font-semibold tracking-tight text-[#272343]"
          >
            Nội dung khóa học
          </h2>
          <span className="text-xs font-medium text-[#6b7280]">
            {sections.length} chương · {stats.lessons} bài học
            {stats.quizzes > 0 && ` · ${stats.quizzes} bài kiểm tra`}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {[...sections]
            .sort((a, b) => (a.orders || 0) - (b.orders || 0))
            .map((section, idx) => (
              <SectionAccordion
                key={section.id}
                section={section}
                index={idx}
                onPreview={handlePreview}
              />
            ))}
        </div>
      </section>

      <VideoPreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        lesson={previewLesson}
        sections={sections}
      />
    </>
  );
}

function SectionAccordion({ section, index, onPreview }) {
  const [isOpen, setIsOpen] = useState(index === 0);

  // Calculate section stats
  const lessonCount =
    section.items?.filter((item) => item.kind === "Lesson").length || 0;
  const quizCount =
    section.items?.filter((item) => item.kind === "Quiz").length || 0;

  return (
    <details
      className="group rounded-2xl border border-[#e5e7eb] bg-[#fffffe]"
      open={isOpen}
    >
      <summary
        className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 sm:px-5 list-none"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
      >
        <div>
          <div className="text-sm font-medium text-[#272343]">
            Chương {section.orders || index + 1} ·{" "}
            {section.title || `Chương ${index + 1}`}
          </div>
          <div className="mt-1 text-xs text-[#6b7280]">
            {lessonCount} bài giảng
            {quizCount > 0 && ` · ${quizCount} bài kiểm tra`}
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-[#6b7280] transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </summary>

      {isOpen && (
        <div className="border-t border-[#e5e7eb] px-4 py-3 sm:px-5">
          {section.items && section.items.length > 0 ? (
            <ul className="space-y-2 text-sm text-[#2d334a]">
              {section.items
                .sort((a, b) => (a.orders || 0) - (b.orders || 0))
                .map((item) => {
                  if (item.kind === "Lesson") {
                    return (
                      <LessonItem
                        key={item.id}
                        lesson={item}
                        onPreview={onPreview}
                      />
                    );
                  } else if (item.kind === "Quiz") {
                    return <QuizItem key={item.id} quiz={item} />;
                  }
                  return null;
                })}
            </ul>
          ) : (
            <p className="text-sm text-[#6b7280] text-center py-4">
              Chương này chưa có nội dung
            </p>
          )}
        </div>
      )}
    </details>
  );
}

function LessonItem({ lesson, onPreview }) {
  const isVideo = lesson.lessonType === "Video";
  const isFree = lesson.isFree;
  const canPreview = isFree && isVideo;
  const duration = "07:32"; // You can get this from lesson data if available

  return (
    <li className="flex items-center justify-between gap-2 py-2 hover:text-[#272343] transition-colors">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isVideo ? (
          <PlayCircle className="h-3.5 w-3.5 text-[#272343] flex-shrink-0" />
        ) : (
          <FileText className="h-3.5 w-3.5 text-[#272343] flex-shrink-0" />
        )}
        <span className="truncate">{lesson.title}</span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {isFree ? (
          <>
            {canPreview && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(lesson);
                }}
                size="sm"
                className="h-auto py-1 px-2 text-xs bg-[#FFD54F] hover:bg-[#ffca28] text-[#272343] font-medium rounded-md"
              >
                <Eye className="w-3 h-3 mr-1" />
                Xem trước
              </Button>
            )}
            <span className="text-xs text-[#16a34a] font-medium flex items-center gap-1">
              <Unlock className="w-3 h-3" />
              Miễn phí
            </span>
          </>
        ) : (
          <Lock className="w-3 h-3 text-[#9ca3af]" />
        )}
        {isVideo && <span className="text-xs text-[#6b7280]">{duration}</span>}
      </div>
    </li>
  );
}

function QuizItem({ quiz }) {
  return (
    <li className="flex items-center justify-between gap-2 py-2 hover:text-[#272343] transition-colors bg-[#fef3c7]/30 rounded-lg px-3 -mx-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <HelpCircle className="h-3.5 w-3.5 text-[#f59e0b] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="block truncate font-medium">{quiz.title}</span>
          {quiz.description && (
            <span className="block text-xs text-[#6b7280] truncate">
              {quiz.description}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Timer */}
        {quiz.timer && (
          <div className="flex items-center gap-1 text-xs text-[#6b7280]">
            <Clock className="w-3 h-3" />
            <span>{quiz.timer} phút</span>
          </div>
        )}

        {/* Pass Percent */}
        {quiz.passPercent && (
          <div className="flex items-center gap-1 text-xs text-[#6b7280]">
            <Target className="w-3 h-3" />
            <span>{quiz.passPercent}%</span>
          </div>
        )}

        {/* Quiz Action Button */}
        <Button
          size="sm"
          variant="outline"
          className="h-auto py-1 px-2 text-xs border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6] hover:text-white rounded-md font-medium"
        >
          Kiểm tra
        </Button>

        {/* Lock Icon */}
        <Lock className="w-3 h-3 text-[#9ca3af]" />
      </div>
    </li>
  );
}
