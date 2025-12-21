import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileText, Unlock, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { extractCleanText } from "@/utils/htmlUtils";
import { Spin } from "antd";

export default function TextPreviewModal({
  isOpen,
  onClose,
  lesson,
  sections = [],
}) {
  const [currentLesson, setCurrentLesson] = useState(null);

  useEffect(() => {
    if (lesson) {
      setCurrentLesson(lesson);
    }
  }, [lesson]);

  const freeTextLessons = useMemo(() => {
    if (!sections.length) return [];

    const result = [];

    sections.forEach((section) => {
      section.items?.forEach((item) => {
        if (
          item.kind === "Lesson" &&
          item.lessonType === "Text" &&
          item.isFree
        ) {
          result.push({
            ...item,
            sectionTitle: section.title,
            sectionOrder: section.orders,
          });
        }
      });
    });

    return result.sort((a, b) => {
      if (a.sectionOrder !== b.sectionOrder) {
        return a.sectionOrder - b.sectionOrder;
      }
      return a.orders - b.orders;
    });
  }, [sections]);

  useEffect(() => {
    if (!currentLesson && freeTextLessons.length > 0) {
      setCurrentLesson(freeTextLessons[0]);
    }
  }, [currentLesson, freeTextLessons]);

  const htmlContent = useMemo(() => {
    if (!currentLesson?.assets) return null;

    return (
      currentLesson.assets.find(
        (a) => typeof a.content === "string" && a.content.trim() !== ""
      )?.content || null
    );
  }, [currentLesson]);

  const cleanDescription = useMemo(() => {
    if (htmlContent) return extractCleanText(htmlContent, 160);
    return currentLesson?.description || "";
  }, [htmlContent, currentLesson]);

  const hasMultipleTexts = freeTextLessons.length > 1;
  function LoadingState() {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <Spin />
      </div>
    );
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 overflow-hidden flex flex-col gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-[#FFD54F]/10 to-[#FFC107]/5 flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-gray-900 pr-8">
            Những bài học xem trước miễn phí
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Nội dung bài học dạng văn bản được phép xem trước
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6 space-y-4">
              {currentLesson ? (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {currentLesson.title}
                    </h3>

                    {cleanDescription && (
                      <p className="text-sm text-gray-600">
                        {cleanDescription}
                      </p>
                    )}
                  </div>

                  {htmlContent ? (
                    <div className="prose prose-sm max-w-none border border-gray-200 rounded-lg p-4 bg-white">
                      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                    </div>
                  ) : (
                    <EmptyState />
                  )}
                </>
              ) : (
                <LoadingState />
              )}
            </div>
          </div>

          {/* Sidebar */}
          {hasMultipleTexts && (
            <aside className="lg:w-96 w-full border-t lg:border-t-0 lg:border-l bg-gray-50/50 flex flex-col min-h-0">
              <div className="p-4 border-b bg-white">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#FFD54F]" />
                  Các bài xem trước ({freeTextLessons.length})
                </h4>
                <p className="text-xs text-gray-500 mt-1">Nhấp để chuyển bài</p>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
                {freeTextLessons.map((item, index) => {
                  const isActive = item.id === currentLesson?.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentLesson(item)}
                      className={`w-full text-left p-4 transition-all ${
                        isActive
                          ? "bg-[#FFD54F]/20 border-l-4 border-l-[#FFD54F]"
                          : "hover:bg-gray-100 border-l-4 border-l-transparent"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold bg-gray-200">
                          {index + 1}
                        </div>

                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">
                            {item.sectionTitle}
                          </div>

                          <div className="text-sm font-semibold">
                            {item.title}
                          </div>

                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                              <Unlock className="w-3 h-3" />
                              Miễn phí
                            </span>

                            {isActive && (
                              <span className="text-xs px-2 py-1 rounded-full bg-[#FFD54F] text-gray-900">
                                Đang xem
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
