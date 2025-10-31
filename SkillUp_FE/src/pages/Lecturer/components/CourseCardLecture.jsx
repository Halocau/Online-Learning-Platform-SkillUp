import { Eye, Edit2, Trash2 } from "lucide-react";
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

  return (
    <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row md:items-start">
          {/* Image Section */}
          <div className="md:w-48 md:h-48 flex-shrink-0">
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
              <div className="w-full h-40 md:h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">📚 No Image</span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              {/* Header with title and status */}
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="text-lg font-semibold text-gray-900">
                  {course.title}
                </h3>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                    course.status === "Draft"
                      ? "bg-blue-100 text-blue-800"
                      : course.status === "Published"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {course.status || "Nháp"}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-4 line-clamp-2">
                {course.description}
              </p>

              {/* Course Info Grid - Enhanced with more info */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mb-4">
                <div className="transform transition-transform hover:scale-105">
                  <p className="text-gray-500 text-xs">📅 Ngày tạo</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(course.createdAt)}
                  </p>
                </div>

                <div className="transform transition-transform hover:scale-105">
                  <p className="text-gray-500 text-xs">🏷️ Danh mục</p>
                  <p
                    className="font-semibold text-gray-900 truncate"
                    title={course.categoryName || "N/A"}
                  >
                    {course.categoryName || "N/A"}
                  </p>
                </div>

                <div className="transform transition-transform hover:scale-105">
                  <p className="text-gray-500 text-xs">📂 Danh mục con</p>
                  <p
                    className="font-semibold text-gray-900 truncate"
                    title={course.subCategoryName || "N/A"}
                  >
                    {course.subCategoryName || "N/A"}
                  </p>
                </div>

                <div className="transform transition-transform hover:scale-105">
                  <p className="text-gray-500 text-xs">💰 Giá</p>
                  <p className="font-semibold text-yellow-600">
                    {course.price > 0
                      ? `${course.price.toLocaleString("vi-VN")} VND`
                      : "Miễn phí"}
                  </p>
                </div>

                <div className="transform transition-transform hover:scale-105">
                  <p className="text-gray-500 text-xs">👥 Học viên</p>
                  <p className="font-semibold text-gray-900">
                    {course.enrollmentCount || 0}
                  </p>
                </div>

                <div className="transform transition-transform hover:scale-105">
                  <p className="text-gray-500 text-xs">⭐ Đánh giá</p>
                  <p className="font-semibold text-gray-900">
                    {course.rating?.toFixed(1) || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => onView(course.id)}
                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-all duration-200 transform hover:scale-110"
                title="Xem chi tiết"
                disabled={isDeleting}
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => onEdit(course.id)}
                className="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600 transition-all duration-200 transform hover:scale-110"
                title="Chỉnh sửa"
                disabled={isDeleting}
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(course.id)}
                className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-all duration-200 transform hover:scale-110 disabled:opacity-50"
                title="Xóa"
                disabled={isDeleting}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseCardLecture;
