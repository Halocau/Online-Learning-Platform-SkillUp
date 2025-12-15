import { useState } from "react";
import { Star, X, Award, Send } from "lucide-react";
import { cn } from "@/lib/utils.js";

const RatingModal = ({
  courseName,
  courseId,
  existingRating = null,
  onSubmit,
  onClose,
}) => {
  const [rating, setRating] = useState(existingRating?.star || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState(existingRating?.contents || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!existingRating;

  const handleSubmit = async () => {
    if (rating === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        courseId,
        star: rating,
        contents: review,
        ratingId: existingRating?.ratingId,
      });
      onClose();
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingDescriptions = {
    1: {
      label: "Rất tệ",
      description: "Không như mong đợi",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    2: {
      label: "Kém",
      description: "Khá thất vọng",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    3: {
      label: "Bình thường",
      description: "Đáp ứng được một phần",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    4: {
      label: "Tốt",
      description: "Hài lòng, như tôi mong đợi",
      color: "text-lime-600",
      bgColor: "bg-lime-50",
    },
    5: {
      label: "Xuất sắc",
      description: "Tuyệt vời, trên cả mong đợi",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  };

  const currentRating = hoverRating || rating;
  const currentDescription = ratingDescriptions[currentRating];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full">
        {/* Header */}
        <div className="relative p-5 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFD54F] flex items-center justify-center">
              <Award className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditMode ? "Chỉnh sửa đánh giá" : "Chúc mừng! "}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditMode
                  ? "Cập nhật đánh giá của bạn"
                  : "Bạn đã hoàn thành khóa học"}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Course Name */}
          <div className="bg-gradient-to-r from-[#FFF9E6] to-[#FFF3CD] p-3 rounded-lg border border-[#FFD54F]/30">
            <p className="text-xs text-gray-600 mb-1">
              {isEditMode ? "Khóa học" : "Khóa học đã hoàn thành"}
            </p>
            <h3 className="font-semibold text-gray-900 text-sm">
              {courseName}
            </h3>
          </div>

          {/* Rating Section */}
          <div className="text-center">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Bạn đánh giá khóa học này như thế nào?
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Phản hồi của bạn giúp chúng tôi cải thiện trải nghiệm học tập
            </p>

            {/* Star Rating */}
            <div className="flex items-center justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={cn(
                      "w-10 h-10 transition-all duration-200",
                      star <= currentRating
                        ? "fill-[#FFD54F] text-[#FFD54F] drop-shadow-md"
                        : "text-gray-300"
                    )}
                  />
                </button>
              ))}
            </div>

            {/* Rating Description */}
            <div className="h-16 flex items-center justify-center">
              {currentRating > 0 && currentDescription && (
                <div
                  className={cn(
                    "inline-flex flex-col items-center gap-0.5 px-5 py-2 rounded-lg transition-all duration-200",
                    currentDescription.bgColor
                  )}
                >
                  <p
                    className={cn(
                      "text-lg font-bold",
                      currentDescription.color
                    )}
                  >
                    {currentDescription.label}
                  </p>
                  <p
                    className={cn(
                      "text-xs font-medium",
                      currentDescription.color
                    )}
                  >
                    {currentDescription.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Review Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chia sẻ trải nghiệm của bạn
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Bạn thích gì ở khóa học này? Điều gì có thể cải thiện?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD54F] focus:border-transparent resize-none transition-all text-sm"
              rows={4}
              maxLength={500}
              required
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-xs text-gray-500">
                Giúp học viên khác đưa ra quyết định sáng suốt
              </p>
              <p className="text-xs text-gray-500">{review.length}/500</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2. 5 text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
          >
            {isEditMode ? "Hủy" : "Bỏ qua"}
          </button>

          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="flex items-center gap-2 px-5 py-2. 5 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:bg-gray-300 shadow-md hover:shadow-lg text-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                {isEditMode ? "Đang cập nhật..." : "Đang gửi..."}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {isEditMode ? "Cập nhật" : "Gửi đánh giá"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
