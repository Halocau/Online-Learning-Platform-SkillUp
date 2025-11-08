import { Eye, Edit2, Trash2, Calendar, RefreshCw, DollarSign, Users, Tag, FolderOpen, Star } from "lucide-react";
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
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-40 md:h-40 flex-shrink-0">
            {course.image && !imageError ? (
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-32 md:h-40 object-cover"
                onError={handleImageError}
                crossOrigin="anonymous"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-32 md:h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No Image</span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4 md:p-6 flex flex-col justify-between relative">
            {/* Action Buttons - Top Right */}
            <div className="absolute top-4 right-4 flex gap-1 md:gap-2 bg-white rounded-lg p-1 md:p-2 shadow-sm border border-gray-100">
              <button
                onClick={() => onEdit(course.id)}
                className="p-2 hover:bg-yellow-50 rounded text-yellow-600 transition-all duration-200 transform hover:scale-110"
                title="Chỉnh sửa"
                disabled={isDeleting}
              >
                <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={() => onDelete(course.id)}
                className="p-2 hover:bg-red-50 rounded text-red-600 transition-all duration-200 transform hover:scale-110 disabled:opacity-50"
                title="Xóa"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Header with title and status */}
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap pr-24">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">
                  {course.title}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors flex-shrink-0 ${
                    course.status === "Draft"
                      ? "bg-blue-100 text-blue-800"
                      : course.status === "Published"
                      ? "bg-green-100 text-green-800"
                      : course.status === "Unpublish"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {course.status || "Nháp"}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {course.description}
              </p>

              {/* Course Info Grid - 7 fields organized in 2 rows */}
              <div className="space-y-3">
                {/* First Row - 4 fields */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs md:text-sm">
                  <div className="transform transition-transform hover:scale-105">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>Ngày Tạo</span>
                    </div>
                    <p className="font-semibold text-gray-900 ml-5">
                      {formatDate(course.createdAt)}
                    </p>
                  </div>

                  <div className="transform transition-transform hover:scale-105">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1">
                      <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
                      <span>Cập Nhật</span>
                    </div>
                    <p className="font-semibold text-gray-900 ml-5">
                      {formatDate(course.updatedAt)}
                    </p>
                  </div>

                  <div className="transform transition-transform hover:scale-105">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-green-500" />
                      <span>Giá</span>
                    </div>
                    <p className="font-semibold text-yellow-600 ml-5">
                      {course.price > 0
                        ? `${course.price.toLocaleString("vi-VN")}đ`
                        : "Miễn phí"}
                    </p>
                  </div>

                  <div className="transform transition-transform hover:scale-105">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Học Viên</span>
                    </div>
                    <p className="font-semibold text-gray-900 ml-5">
                      {course.enrollmentCount || 0}
                    </p>
                  </div>
                </div>

                {/* Second Row - 3 fields */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs md:text-sm">
                  <div className="transform transition-transform hover:scale-105">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1">
                      <Tag className="w-3.5 h-3.5 text-rose-500" />
                      <span>Danh Mục</span>
                    </div>
                    <p
                      className="font-semibold text-gray-900 truncate ml-5"
                      title={course.categoryName || "N/A"}
                    >
                      {course.categoryName || "N/A"}
                    </p>
                  </div>

                  <div className="transform transition-transform hover:scale-105">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1">
                      <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                      <span>Danh Mục Con</span>
                    </div>
                    <p
                      className="font-semibold text-gray-900 truncate ml-5"
                      title={course.subCategoryName || "N/A"}
                    >
                      {course.subCategoryName || "N/A"}
                    </p>
                  </div>

                  <div className="transform transition-transform hover:scale-105">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span>Đánh Giá</span>
                    </div>
                    <p className="font-semibold text-gray-900 ml-5">
                      {course.rating?.toFixed(1) || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseCardLecture;