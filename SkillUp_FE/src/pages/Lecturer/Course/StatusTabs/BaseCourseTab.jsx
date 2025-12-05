// src/pages/Lecturer/components/tabs/BaseCourseTab.jsx
import { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CourseCardLecture from "../../components/CourseCardLecture";

function BaseCourseTab({
  courses,
  onEdit,
  onDelete,
  onPreview,
  onReopen,
  deletingId,
  showPendingBanner = false,
  emptyMessage = "Không có khóa học nào",
  emptyDescription = "Chưa có khóa học trong danh mục này",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());

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

    return matchesSearch && matchesDate;
  });

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

  const totalPages = Math.ceil(sortedCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCourses = sortedCourses.slice(startIndex, endIndex);

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
    setShowSortMenu(false);
  };

  const handleDateChange = (type, value) => {
    if (type === "start") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    setCurrentPage(1);
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const resetAllFilters = () => {
    setSearchTerm("");
    setSortBy("newest");
    setStartDate("");
    setEndDate("");
    setShowSortMenu(false);
    setShowDateFilter(false);
    setCurrentPage(1);
  };

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-600">{emptyDescription}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          {/* Sort Dropdown - INCREASED SIZE */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-base"
            >
              <span className="text-base font-medium">
                Sắp xếp:{" "}
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
              <ChevronDown className="w-5 h-5" />
            </button>

            {showSortMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-56">
                {[
                  { value: "newest", label: "Mới nhất" },
                  { value: "oldest", label: "Cũ nhất" },
                  { value: "title", label: "Tên (A-Z)" },
                  { value: "rating", label: "Đánh giá cao nhất" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg transition-colors text-base ${
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

          {/* Date Filter */}
          <div className="relative">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg border transition-colors text-base ${
                startDate || endDate
                  ? "bg-yellow-50 border-yellow-300 text-yellow-700 font-semibold"
                  : "bg-white border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span className="text-base font-medium">Khoảng thời gian</span>
              {(startDate || endDate) && (
                <span className="text-xs bg-yellow-200 px-2 py-1 rounded">
                  ✓
                </span>
              )}
              <ChevronDown className="w-5 h-5" />
            </button>

            {showDateFilter && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-72 p-4 space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateChange("start", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-base"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateChange("end", e.target.value)}
                    className="w-full px-3 py-2.  5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-base"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={clearDateFilter}
                    className="w-full px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors font-medium"
                  >
                    Xóa bộ lọc ngày
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Reset Button */}
          <button
            onClick={resetAllFilters}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors text-base"
            title="Đặt lại tất cả bộ lọc"
          >
            <RotateCcw className="w-5 h-5 text-red-600" />

            <span className="text-base font-medium text-red-600">Đặt lại</span>
          </button>

          {/* Items Per Page */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-base text-gray-600">Hiển thị:</span>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2. 5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="text-base text-gray-600">/trang</span>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-base text-gray-600">
            Hiển thị{" "}
            <strong className="text-gray-900">
              {paginatedCourses.length > 0 ? startIndex + 1 : 0}-
              {Math.min(endIndex, sortedCourses.length)}
            </strong>{" "}
            trong tổng số{" "}
            <strong className="text-gray-900">{sortedCourses.length}</strong>{" "}
            khóa học
          </span>
        </div>
      </div>
      {/* Courses List */}
      {sortedCourses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy khóa học
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? `Không có khóa học nào phù hợp với từ khóa "${searchTerm}"`
                : "Không có khóa học nào với bộ lọc hiện tại"}
            </p>
            <Button
              onClick={resetAllFilters}
              variant="outline"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Đặt lại bộ lọc
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedCourses.map((course) => (
              <CourseCardLecture
                key={course.id}
                course={course}
                onEdit={onEdit}
                onDelete={onDelete}
                onPreview={onPreview}
                onReopen={onReopen}
                isDeleting={deletingId === course.id}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="text-sm text-gray-600">
                Trang <strong className="text-gray-900">{currentPage}</strong> /{" "}
                <strong className="text-gray-900">{totalPages}</strong>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Trước</span>
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg font-semibold transition-all duration-200 ${
                          currentPage === pageNum
                            ? "bg-yellow-500 text-white shadow-md transform scale-110"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <span className="hidden sm:inline">Sau</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm text-gray-600">
                Tổng:{" "}
                <strong className="text-gray-900">
                  {sortedCourses.length}
                </strong>{" "}
                khóa học
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BaseCourseTab;
