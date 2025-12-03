// src/pages/contentmoderator/CoursePendingTab. jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  UserIcon,
  TagIcon,
  UsersIcon,
  CurrencyDollarIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { courseAPI } from "@/api/courseAPI";
import { Spin } from "antd";

export default function CoursePendingTab({ courses, fetchCourses }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter pending courses
  const pendingCourses = courses.filter((c) => c.status === "Pending");

  // Filter by search
  const filteredCourses = pendingCourses.filter((course) =>
    course.title?. toLowerCase().includes(searchTerm. toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to page 1 when search or items per page changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const handleReview = async (isApproved) => {
    if (!isApproved && !feedback. trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      setLoading(true);
      await courseAPI.reviewCourse(selectedCourse.id, {
        isApproved,
        feedback: feedback.trim() || null,
      });

      toast.success(
        isApproved
          ? "Đã duyệt khóa học thành công!"
          : "Đã từ chối khóa học thành công!"
      );

      setSelectedCourse(null);
      setFeedback("");
      fetchCourses();
    } catch (error) {
      toast. error("Đã xảy ra lỗi. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedCourse) {
    return (
      <div className="bg-white rounded-b-xl shadow-sm">
        {/* Back Button */}
        <div className="p-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCourse(null);
              setFeedback("");
            }}
            className="gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại danh sách
          </Button>
        </div>

        {/* Course Detail */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Image and Basic Info */}
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={selectedCourse.image}
                  alt={selectedCourse.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <UserIcon className="h-5 w-5" />
                  <span className="font-medium">Giảng viên:</span>
                  <span>{selectedCourse.lecturerName}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <TagIcon className="h-5 w-5" />
                  <span className="font-medium">Danh mục:</span>
                  <span>{selectedCourse.subCategoryName}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <UsersIcon className="h-5 w-5" />
                  <span className="font-medium">Học viên:</span>
                  <span>{selectedCourse.enrollmentCount || 0}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <CurrencyDollarIcon className="h-5 w-5" />
                  <span className="font-medium">Giá:</span>
                  <span className="font-semibold text-green-600">
                    {selectedCourse.price === 0
                      ? "Miễn phí"
                      : `${selectedCourse.price.toLocaleString()} VND`}
                  </span>
                </div>

                {selectedCourse.rating > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <StarIcon className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">Đánh giá:</span>
                    <span>{selectedCourse.rating. toFixed(1)}/5</span>
                  </div>
                )}

                <div className="pt-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                    Đang chờ duyệt
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Description and Review */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedCourse.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {selectedCourse.description}
                </p>
              </div>

              {/* Review Section */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Đánh giá khóa học
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phản hồi (Bắt buộc nếu từ chối)
                  </label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target. value)}
                    placeholder="Nhập lý do từ chối hoặc ghi chú..."
                    rows={6}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="default"
                    size="lg"
                    onClick={() => handleReview(true)}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {loading ?  <Spin size="small" /> : "Duyệt khóa học"}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleReview(false)}
                    disabled={loading}
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    {loading ? <Spin size="small" /> : "Từ chối"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Search */}
      <div className="bg-white p-4 shadow-sm">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {filteredCourses.length} khóa học đang chờ duyệt
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hiển thị:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Course List */}
      <div className="bg-white rounded-b-xl shadow-sm">
        {paginatedCourses.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            Không có khóa học nào đang chờ duyệt
          </div>
        ) : (
          <div className="divide-y">
            {paginatedCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className="p-4 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex gap-4">
                  {/* Course Image */}
                  <div className="w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={course.image}
                      alt={course. title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Course Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                          {course. title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                          {course. description}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 whitespace-nowrap">
                        Chờ duyệt
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <UserIcon className="h-4 w-4" />
                        {course.lecturerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <TagIcon className="h-4 w-4" />
                        {course.subCategoryName}
                      </span>
                      <span className="flex items-center gap-1">
                        <UsersIcon className="h-4 w-4" />
                        {course.enrollmentCount || 0} học viên
                      </span>
                      <span className="font-semibold text-green-600">
                        {course.price === 0
                          ? "Miễn phí"
                          : `${course.price. toLocaleString()} VND`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm gap-4">
          <div className="text-sm text-gray-600">
            Trang {currentPage} / {totalPages}
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Trước
            </Button>

            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  Math.abs(pageNumber - currentPage) <= 1
                ) {
                  return (
                    <Button
                      key={pageNumber}
                      variant={
                        currentPage === pageNumber ?  "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return (
                    <span key={pageNumber} className="px-2 py-1">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Sau
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}