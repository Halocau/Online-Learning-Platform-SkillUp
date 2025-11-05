// src/components/course-detail/VideoPreviewModal.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PlayCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VideoPreviewModal({ isOpen, onClose, lesson }) {
  if (!lesson) return null;

  const videoUrl = lesson.assets?.[0]?.url;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                {lesson.title}
              </DialogTitle>
              {lesson.description && (
                <DialogDescription className="text-gray-600">
                  {lesson.description}
                </DialogDescription>
              )}
              <div className="flex items-center gap-2 mt-3">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  Miễn phí xem trước
                </span>
                <span className="px-3 py-1 bg-[#FFD54F]/20 text-gray-700 text-xs font-semibold rounded-full">
                  Video
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Video Player */}
        <div className="relative bg-black aspect-video">
          {videoUrl && videoUrl !== "default-url" ? (
            <video
              controls
              autoPlay
              className="w-full h-full"
              controlsList="nodownload"
            >
              <source src={videoUrl} type="video/mp4" />
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Video không khả dụng</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 pt-4 bg-gray-50">
          <p className="text-sm text-gray-600">Nội dung miễn phí</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
