// src/components/course-detail/VideoPreviewModal.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

export default function VideoPreviewModal({ isOpen, onClose, lesson }) {
  if (!lesson) return null;

  // Get video URL from assets array
  const videoUrl = lesson.assets?.[0]?.url || null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900 pr-8">
              {lesson.title}
            </DialogTitle>
            <button
              onClick={onClose}
              className="absolute right-6 top-6 rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          {lesson.description && (
            <p className="text-sm text-gray-600 mt-2">{lesson.description}</p>
          )}
        </DialogHeader>

        <div className="p-6 pt-4">
          {videoUrl ? (
            <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
              <video
                controls
                className="w-full h-full"
                src={videoUrl}
                controlsList="nodownload"
              >
                <source src={videoUrl} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ video.
              </video>
            </div>
          ) : (
            <div className="flex items-center justify-center aspect-video bg-gray-100 rounded-lg">
              <p className="text-gray-500">Không có video để hiển thị</p>
            </div>
          )}

          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-medium">
              ✨ Đây là bài học miễn phí. Đăng ký khóa học để truy cập toàn bộ
              nội dung!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
