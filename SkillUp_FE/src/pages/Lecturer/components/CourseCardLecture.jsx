import { Edit2, Calendar, RefreshCw, EyeOff, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

function CourseCardLecture({
  course,
  onView,
  onEdit,
  onDelete,
  isDeleting = false,
}) {
  const [imageError, setImageError] = useState(false);

  // Check if course is pending and should be locked from editing
  const isPendingStatus = course.status === "Pending";

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "N/A";
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getPublishStatusText = (status) => {
    switch (status) {
      case "Draft":
        return "Nháp";
      case "Public":
        return "Xuất bản";
      case "Unpublish":
        return "Chưa xuất bản";
      case "Pending":
        return "Đang chờ duyệt";
      default:
        return status;
    }
  };

  // Calculate course completion progress
  const calculateProgress = () => {
    let completed = 0;
    const total = 4;
    completed++;

    if (course.sections && course.sections.length > 0) {
      completed++;
    }

    if (course.price !== null && course.price !== undefined) {
      completed++;
    }

    completed++;

    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();

  return (
    <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-l-blue-500 border-r-4 border-r-blue-500">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-48 md:h-48 flex-shrink-0 relative">
            {course.image && !imageError ? (
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-40 md:h-48 object-cover"
                onError={handleImageError}
                crossOrigin="anonymous"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-40 md:h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <span className="text-blue-400 text-sm font-medium">
                  No Image
                </span>
              </div>
            )}

            {/* Pending Status Badge on Image */}
            {isPendingStatus && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md flex items-center gap-1 shadow-md">
                <Lock className="w-3 h-3" />
                <span className="text-xs font-semibold">Chờ duyệt</span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-5 md:p-6 flex flex-col justify-between relative">
            {/* Action Buttons - Top Right */}
            <div className="absolute top-4 right-4 flex gap-2 bg-white rounded-lg p-1.5 shadow-md border border-gray-200">
              {/* Edit Button - Disabled for Pending status */}
              <div className="relative group">
                <button
                  onClick={() => !isPendingStatus && onEdit(course.id)}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    isPendingStatus
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "hover:bg-yellow-50 text-yellow-600 transform hover:scale-110"
                  }`}
                  title={
                    isPendingStatus
                      ? "Không thể chỉnh sửa khóa học đang chờ duyệt"
                      : "Chỉnh sửa"
                  }
                  disabled={isPendingStatus || isDeleting}
                >
                  {isPendingStatus ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Edit2 className="w-4 h-4" />
                  )}
                </button>

                {/* Tooltip for disabled edit button */}
                {isPendingStatus && (
                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        <span>Không thể chỉnh sửa khi đang chờ duyệt</span>
                      </div>
                      <div className="text-gray-300 mt-1">
                        Vui lòng chờ admin phê duyệt
                      </div>
                      {/* Arrow */}
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => onDelete(course.id)}
                className="p-2 hover:bg-red-50 rounded-md text-red-600 transition-all duration-200 transform hover:scale-110 disabled:opacity-50"
                title="Ẩn khóa học"
                disabled={isDeleting}
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>

            {/* Header with title and status */}
            <div>
              <div className="flex items-start gap-3 mb-3 pr-24">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">
                      {course.title}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors flex-shrink-0 ${
                        course.status === "Draft"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : course.status === "Public"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : course.status === "Unpublish"
                          ? "bg-orange-100 text-orange-800 border border-orange-200"
                          : course.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                      }`}
                    >
                      {getPublishStatusText(course.status)}
                    </span>
                  </div>

                  {/* Date Information - Next to Title */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-medium">Tạo:</span>
                      <span className="text-gray-700 font-semibold">
                        {formatDate(course.createdAt)}
                      </span>
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
                      <span className="font-medium">Cập nhật:</span>
                      <span className="text-gray-700 font-semibold">
                        {formatDate(course.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-3">
                {course.description || "Chưa có mô tả cho khóa học này."}
              </p>

              {/* Pending Status Warning Message */}
              {isPendingStatus && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                  <Lock className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-yellow-800 mb-1">
                      Khóa học đang chờ duyệt
                    </p>
                    <p className="text-xs text-yellow-700">
                      Bạn không thể chỉnh sửa khóa học trong khi đang chờ admin
                      phê duyệt. Vui lòng chờ kết quả phê duyệt.
                    </p>
                  </div>
                </div>
              )}

              {/* Progress Bar - Bottom of Card */}
              {/* <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-600">
                    Tiến độ hoàn thành khóa học
                  </span>
                  <span
                    className={`text-xs font-bold ${getProgressTextColor()}`}
                  >
                    {progress === 100 ? "✓ Hoàn thành" : `${progress}%`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${getProgressColor()} h-2 rounded-full transition-all duration-500 relative overflow-hidden`}
                    style={{ width: `${progress}%` }}
                  >
                    {/* Shimmer effect for incomplete progress */}
              {/* {progress < 100 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    )}
                  </div>
                </div>
                {progress < 100 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Còn {100 - progress}% để hoàn thiện khóa học
                  </p>
                )} */}
              {/* </div> */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseCardLecture;