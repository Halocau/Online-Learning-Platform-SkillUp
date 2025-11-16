import { useState } from "react";
import { Star, X, Award, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const RatingModal = ({ courseName, onSubmit, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(rating, review);
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels = {
    1: "Kém",
    2: "Trung bình",
    3: "Tốt",
    4: "Rất tốt",
    5: "Xuất sắc",
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#FFD54F] flex items-center justify-center">
              <Award className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Chúc mừng!
              </h2>
              <p className="text-gray-600">Bạn đã hoàn thành khóa học</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Course Name */}
          <div className="bg-gradient-to-r from-[#FFF9E6] to-[#FFF3CD] p-4 rounded-lg border border-[#FFD54F]/30">
            <p className="text-sm text-gray-600 mb-1">Khóa học đã hoàn thành</p>
            <h3 className="font-semibold text-gray-900">{courseName}</h3>
          </div>

          {/* Rating Section */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Bạn đánh giá khóa học này như thế nào?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
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
                      "w-10 h-10 transition-colors",
                      star <= (hoverRating || rating)
                        ? "fill-[#FFD54F] text-[#FFD54F]"
                        : "text-gray-300"
                    )}
                  />
                </button>
              ))}
            </div>

            {/* Rating Label */}
            {(hoverRating || rating) > 0 && (
              <p className="text-lg font-medium text-gray-700 animate-fade-in">
                {ratingLabels[hoverRating || rating]}
              </p>
            )}
          </div>

          {/* Review Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chia sẻ trải nghiệm của bạn (tùy chọn)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Bạn thích gì ở khóa học này? Điều gì có thể cải thiện?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD54F] focus:border-transparent resize-none"
              rows={5}
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                Giúp học viên khác đưa ra quyết định sáng suốt
              </p>
              <p className="text-xs text-gray-500">
                {review.length}/500
              </p>
            </div>
          </div>

          {/* Benefits of Rating */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Tại sao nên đánh giá khóa học này?
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Giúp học viên khác tìm khóa học chất lượng</li>
              <li>• Cung cấp phản hồi có giá trị cho giảng viên</li>
              <li>• Góp phần cải thiện nội dung khóa học</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Bỏ qua
          </button>

          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Gửi đánh giá
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RatingModal;