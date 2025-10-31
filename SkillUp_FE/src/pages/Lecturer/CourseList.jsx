import { useState } from "react";
import { Plus, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { courseAPI } from "@/api/courseAPI";
import { toast } from "react-toastify";
import CourseCardLecture from "./components/CourseCardLecture";

function CourseList({ courses, loading, onRefresh, onCreateClick, onEdit }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Sort and filter state
  const [sortBy, setSortBy] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // NEW: Date range filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);

  // NEW: Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Filter courses by search, status, and date
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || course.status === filterStatus;

    // NEW: Date range filter
    let matchesDate = true;
    if (startDate || endDate) {
      const courseDate = new Date(course.createdAt);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && courseDate >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && courseDate <= end;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Sort filtered courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "title":
        return a.title.localeCompare(b.title);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  // NEW: Pagination logic
  const totalPages = Math.ceil(sortedCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCourses = sortedCourses.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleStatusChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
    setShowFilterMenu(false);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
    setShowSortMenu(false);
  };

  // NEW: Handle date filter change
  const handleDateChange = (type, value) => {
    if (type === "start") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    setCurrentPage(1);
  };

  // NEW: Clear date filter
  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const handleView = (courseId) => {
    toast.info("Chức năng xem chi tiết sẽ được cập nhật");
  };

  const handleEdit = (courseId) => {
    const courseToEdit = courses.find((c) => c.id === courseId);
    if (courseToEdit && onEdit) {
      onEdit(courseId, courseToEdit);
    } else {
      toast.error("Không tìm thấy thông tin khóa học");
    }
  };

  const handleDelete = async (courseId) => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa khóa học này không?"
    );
    if (!confirmed) return;

    try {
      setDeletingId(courseId);
      console.log("Delete id:", courseId);

      const response = await courseAPI.deleteCourse(courseId);
      console.log("Delete data:", response.data);

      if (response.data.code === 200) {
        toast.success("Khóa học đã được xóa thành công");
        console.log("Course deleted successfully");
        setTimeout(() => {
          onRefresh();
        }, 500);
      } else {
        console.error("Delete failed:", response.data.message);
        toast.error(response.data.message || "Lỗi khi xóa khóa học");
        setDeletingId(null);
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        if (error.response.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Lỗi khi xóa khóa học");
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("Lỗi kết nối với máy chủ");
      } else {
        console.error("Error:", error.message);
        toast.error("Lỗi khi xóa khóa học. Vui lòng thử lại.");
      }

      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        <p className="mt-4 text-gray-600">Đang tải khóa học...</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? "Không tìm thấy khóa học" : "Chưa có khóa học nào"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? "Thử tìm kiếm với từ khóa khác"
              : "Bắt đầu tạo khóa học đầu tiên của bạn"}
          </p>
          {!searchTerm && (
            <Button
              onClick={onCreateClick}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo khóa học mới
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Sort, Filter, and Date Controls */}
        <div className="flex gap-3 flex-wrap items-center">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <span className="text-sm font-medium">
                📊 Sắp xếp:{" "}
                {sortBy === "newest"
                  ? "Mới nhất"
                  : sortBy === "oldest"
                  ? "Cũ nhất"
                  : sortBy === "title"
                  ? "Tên (A-Z)"
                  : sortBy === "rating"
                  ? "Đánh giá"
                  : ""}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showSortMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-48">
                {[
                  { value: "newest", label: "Mới nhất" },
                  { value: "oldest", label: "Cũ nhất" },
                  { value: "title", label: "Tên (A-Z)" },
                  { value: "rating", label: "Đánh giá cao nhất" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                      sortBy === option.value
                        ? "bg-yellow-50 text-yellow-700 font-semibold"
                        : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <span className="text-sm font-medium">
                🔍 Lọc:{" "}
                {filterStatus === "all"
                  ? "Tất cả"
                  : filterStatus === "Draft"
                  ? "Nháp"
                  : filterStatus === "Public"
                  ? "Công khai"
                  : filterStatus === "Unpublish"
                  ? "Không công khai"
                  : ""}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showFilterMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-48">
                {[
                  { value: "all", label: "Tất cả" },
                  { value: "Draft", label: "Nháp" },
                  { value: "Public", label: "Công khai" },
                  { value: "Unpublish", label: "Không công khai" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                      filterStatus === option.value
                        ? "bg-yellow-50 text-yellow-700 font-semibold"
                        : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* NEW: Date Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                startDate || endDate
                  ? "bg-yellow-50 border-yellow-300 text-yellow-700 font-semibold"
                  : "bg-white border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span className="text-sm">📅 Ngày</span>
              {(startDate || endDate) && (
                <span className="text-xs bg-yellow-200 px-2 py-1 rounded">
                  ✓
                </span>
              )}
              <ChevronDown className="w-4 h-4" />
            </button>

            {showDateFilter && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-64 p-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateChange("start", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateChange("end", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={clearDateFilter}
                    className="w-full px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                  >
                    🗑️ Xóa bộ lọc ngày
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hiển thị:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="text-sm text-gray-600">/trang</span>
          </div>

          {/* Result count */}
          <div className="ml-auto flex items-center px-4 py-2 text-sm text-gray-600">
            Hiển thị {paginatedCourses.length > 0 ? startIndex + 1 : 0}-
            {Math.min(endIndex, sortedCourses.length)} / {sortedCourses.length}{" "}
            khóa học
          </div>
        </div>
      </div>

      {/* Courses List */}
      {sortedCourses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">
              {searchTerm
                ? `Không tìm thấy khóa học phù hợp với "${searchTerm}"`
                : "Không có khóa học nào"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedCourses.map((course) => (
              <CourseCardLecture
                key={course.id}
                course={course}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deletingId === course.id}
              />
            ))}
          </div>

          {/* NEW: Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg mt-6">
              <div className="text-sm text-gray-600">
                Trang <strong>{currentPage}</strong> /{" "}
                <strong>{totalPages}</strong>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trang trước
                </button>

                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                          currentPage === page
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Trang sau
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm text-gray-600">
                Tổng: <strong>{sortedCourses.length}</strong> khóa học
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CourseList;
