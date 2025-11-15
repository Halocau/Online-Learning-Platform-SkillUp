// src/components/course-detail/VideoPreviewModal.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlayCircle, Unlock, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function VideoPreviewModal({
  isOpen,
  onClose,
  lesson,
  sections,
}) {
  const [currentLesson, setCurrentLesson] = useState(lesson);

  // Update current lesson when the lesson prop changes
  useEffect(() => {
    if (lesson) {
      setCurrentLesson(lesson);
    }
  }, [lesson]);

  if (!currentLesson) return null;

  // Get all free video lessons from all sections
  const getAllFreeVideoLessons = () => {
    if (!sections || sections.length === 0) return [];

    const freeVideos = [];
    sections.forEach((section) => {
      section.items?.forEach((item) => {
        if (
          item.kind === "Lesson" &&
          item.lessonType === "Video" &&
          item.isFree
        ) {
          freeVideos.push({
            ...item,
            sectionTitle: section.title,
            sectionOrder: section.orders,
          });
        }
      });
    });

    // Sort by section order and lesson order
    return freeVideos.sort((a, b) => {
      if (a.sectionOrder !== b.sectionOrder) {
        return a.sectionOrder - b.sectionOrder;
      }
      return a.orders - b.orders;
    });
  };

  const freeVideoLessons = getAllFreeVideoLessons();
  const videoUrl = currentLesson.assets?.[0]?.url || null;
  const hasMultipleVideos = freeVideoLessons.length > 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 overflow-hidden flex flex-col gap-0">
        {/* Fixed Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-[#FFD54F]/10 to-[#FFC107]/5 flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-gray-900 pr-8">
            Những bài học xem trước miễn phí
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
          {/* Main Video Area - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6 space-y-4">
              {/* Video Title and Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {currentLesson.title}
                </h3>
                {currentLesson.description && (
                  <p className="text-sm text-gray-600">
                    {currentLesson.description}
                  </p>
                )}
              </div>

              {/* Video Player */}
              {videoUrl ? (
                <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    controls
                    autoPlay
                    className="w-full h-full"
                    src={videoUrl}
                    controlsList="nodownload"
                    key={currentLesson.id}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Trình duyệt của bạn không hỗ trợ video.
                  </video>
                </div>
              ) : (
                <div className="flex items-center justify-center aspect-video bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <PlayCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Không có video để hiển thị</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview List Sidebar - Scrollable */}
          {hasMultipleVideos && (
            <div className="lg:w-96 w-full border-t lg:border-t-0 lg:border-l bg-gray-50/50 flex flex-col min-h-0 max-h-[50vh] lg:max-h-full">
              {/* Sidebar Header - Fixed */}
              <div className="p-4 border-b bg-white flex-shrink-0">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-[#FFD54F]" />
                  Các bài xem trước ({freeVideoLessons.length})
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Nhấp vào bài học để xem
                </p>
              </div>

              {/* Sidebar Content - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {freeVideoLessons.map((lessonItem, index) => {
                    const isActive = lessonItem.id === currentLesson.id;
                    return (
                      <button
                        key={lessonItem.id}
                        onClick={() => setCurrentLesson(lessonItem)}
                        className={`w-full text-left p-4 transition-all ${
                          isActive
                            ? "bg-[#FFD54F]/20 border-l-4 border-l-[#FFD54F]"
                            : "hover:bg-gray-100 border-l-4 border-l-transparent"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Number or Play Icon */}
                          <div className="flex-shrink-0 mt-1">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                isActive
                                  ? "bg-[#FFD54F] text-gray-900 shadow-md"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {isActive ? (
                                <PlayCircle className="w-5 h-5" />
                              ) : (
                                <span className="text-sm font-bold">
                                  {index + 1}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Lesson Info */}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 mb-1 font-medium">
                              {lessonItem.sectionTitle}
                            </div>
                            <div
                              className={`text-sm font-semibold line-clamp-2 mb-2 ${
                                isActive ? "text-gray-900" : "text-gray-700"
                              }`}
                            >
                              {lessonItem.title}
                            </div>
                            {lessonItem.description && (
                              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                {lessonItem.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium inline-flex items-center gap-1">
                                <Unlock className="w-3 h-3" />
                                Miễn phí
                              </span>
                              {isActive && (
                                <span className="text-xs px-2 py-1 rounded-full bg-[#FFD54F] text-gray-900 font-medium">
                                  Đang phát
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom Close Button - visible on mobile */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 lg:hidden rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
        >
          <X className="w-5 h-5" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
