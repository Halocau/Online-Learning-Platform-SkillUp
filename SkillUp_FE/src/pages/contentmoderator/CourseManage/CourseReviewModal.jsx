// src/pages/contentmoderator/CourseReviewModal.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircleIcon,
  XCircleIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  TagIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { courseAPI } from "@/api/courseAPI";

export default function CourseReviewModal({ reviewModal, closeReviewModal, fetchCourses }) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (reviewModal.open) {
      setAnimate(true);
    }
  }, [reviewModal.open]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => {
      closeReviewModal();
      setFeedback("");
    }, 300);
  };

  // Handle approve/reject course with feedback
  const handleSubmitReview = async () => {
    const { courseId, decision } = reviewModal;

    // Validate feedback for rejection
    if (!decision && !feedback.trim()) {
      toast.error("Vui lòng nhập lý do từ chối khóa học");
      return;
    }

    setIsSubmitting(true);

    try {
      await courseAPI.approveCourse(courseId, decision, feedback);

      if (decision) {
        toast.success("Duyệt khóa học thành công!");
      } else {
        toast.success("Từ chối khóa học thành công!");
      }

      handleClose();
      // Refresh courses list
      await fetchCourses();
    } catch (error) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!reviewModal.courseData || (!reviewModal.open && !animate)) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4 backdrop-blur transition-opacity duration-300 ${
        animate ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl max-w-2xl w-full transform transition-all duration-300 ${
          animate ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div
          className={`relative px-6 py-4 ${
            reviewModal.decision
              ? "bg-gradient-to-r from-blue-500 to-indigo-600"
              : "bg-gradient-to-r from-orange-500 to-red-500"
          } text-white rounded-t-xl`}
        >
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 hover:bg-black hover:bg-opacity-20 rounded-lg transition"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg ${
                reviewModal.decision
                  ? "bg-blue-400 bg-opacity-30"
                  : "bg-orange-400 bg-opacity-30"
              }`}
            >
              {reviewModal.decision ? (
                <CheckCircleIcon className="h-7 w-7" />
              ) : (
                <XCircleIcon className="h-7 w-7" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {reviewModal.decision ? "Duyệt khóa học" : "Từ chối khóa học"}
              </h2>
              <p className="text-blue-50 text-xs mt-0.5">
                {reviewModal.decision
                  ? "Xác nhận phê duyệt và xuất bản"
                  : "Cung cấp lý do từ chối khóa học"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Course Title */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-start gap-2">
              <BookOpenIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base mb-1">
                  {reviewModal.courseData.title}
                </h3>
                {reviewModal.courseData.description && (
                  <p className="text-gray-600 text-xs line-clamp-2">
                    {reviewModal.courseData.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Info Grid - More Compact */}
          <div className="grid grid-cols-2 gap-3">
            {/* Lecturer */}
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2 mb-1">
                <AcademicCapIcon className="h-4 w-4 text-purple-600" />
                <p className="text-xs text-gray-500 font-medium">Giảng viên</p>
              </div>
              <p className="font-bold text-sm text-gray-900 truncate">
                {reviewModal.courseData.lecturerName || "N/A"}
              </p>
            </div>

            {/* Category */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <TagIcon className="h-4 w-4 text-gray-600" />
                <p className="text-xs text-gray-500 font-medium">Danh mục</p>
              </div>
              <p className="font-bold text-sm text-gray-900 truncate">
                {reviewModal.courseData.subCategoryName || "N/A"}
              </p>
            </div>

            {/* Price */}
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-1">
                <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                <p className="text-xs text-gray-500 font-medium">Giá</p>
              </div>
              <p className="font-bold text-sm text-green-600">
                {reviewModal.courseData.price === 0
                  ? "Miễn phí"
                  : `${reviewModal.courseData.price.toLocaleString()} VND`}
              </p>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="space-y-2">
            <label className="block">
              <div className="flex items-center gap-2 mb-2">
                <InformationCircleIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">
                  {reviewModal.decision
                    ? "Phản hồi (Không bắt buộc)"
                    : "Lý do từ chối (Bắt buộc) *"}
                </span>
              </div>
              <Textarea
                placeholder={
                  reviewModal.decision
                    ? "Nhận xét phê duyệt khóa học..."
                    : "Lí do từ chối phê duyệt"
                }
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className={`resize-none text-sm ${
                  !reviewModal.decision && !feedback.trim()
                    ? "border-red-300 focus:border-red-500"
                    : ""
                }`}
              />
              {!reviewModal.decision && !feedback.trim() && (
                <p className="text-xs text-red-600 mt-1">
                  * Bắt buộc khi từ chối khóa học
                </p>
              )}
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 h-11 font-medium"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={
                isSubmitting || (!reviewModal.decision && !feedback.trim())
              }
              className={`flex-1 h-11 font-semibold ${
                reviewModal.decision
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                <>
                  {reviewModal.decision ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Xác nhận duyệt
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Xác nhận từ chối
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}