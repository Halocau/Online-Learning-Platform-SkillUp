import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  AcademicCapIcon,
  BookOpenIcon,
  UsersIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  TagIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";
import { courseAPI } from "@/api/courseAPI";
import { Spin } from "antd";

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [publishTab, setPublishTab] = useState("public");
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Feedback modal states
  const [reviewModal, setReviewModal] = useState({
    open: false,
    courseId: null,
    decision: null,
    courseData: null,
  });
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all courses
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getAllCourses();
      setCourses(response.data?.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách khóa học");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle ban/unban
  const handleBanUnban = async (courseId, isCurrentlyActive) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === courseId
          ? { ...course, isActive: !isCurrentlyActive }
          : course
      )
    );

    try {
      await courseAPI.banUnbanCourse(courseId);
      toast.success(
        `${isCurrentlyActive ? "Cấm" : "Bỏ cấm"} khóa học thành công!`
      );
    } catch (error) {
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId
            ? { ...course, isActive: isCurrentlyActive }
            : course
        )
      );
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
      console.error(error);
    }
  };

  // Open review modal
  const openReviewModal = (courseId, decision, courseData) => {
    setReviewModal({
      open: true,
      courseId,
      decision,
      courseData,
    });
    setFeedback("");
  };

  // Close review modal
  const closeReviewModal = () => {
    setReviewModal({
      open: false,
      courseId: null,
      decision: null,
      courseData: null,
    });
    setFeedback("");
    setIsSubmitting(false);
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

      closeReviewModal();
      // Refresh courses list
      await fetchCourses();
    } catch (error) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and search logic
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.lecturerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subCategoryName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && course.isActive) ||
      (statusFilter === "banned" && !course.isActive);

    const matchesPublishTab =
      (publishTab === "public" && course.status === "Public") ||
      (publishTab === "pending" && course.status === "Pending") ||
      (publishTab === "unpublish" && course.status === "Unpublish");

    return matchesSearch && matchesStatus && matchesPublishTab;
  });

  // Sorting logic
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn]?.toString().toLowerCase() || "";
    const bValue = b[sortColumn]?.toString().toLowerCase() || "";

    if (sortOrder === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = sortedCourses.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle sorting
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // Helper function to translate publish status
  const getPublishStatusText = (status) => {
    switch (status) {
      case "Public":
        return "Xuất bản";
      case "Unpublish":
        return "Ẩn";
      case "Pending":
        return "Đang chờ duyệt";
      default:
        return status;
    }
  };

  // Get count for each tab
  const publicCount = courses.filter((c) => c.status === "Public").length;
  const pendingCount = courses.filter((c) => c.status === "Pending").length;
  const unpublishCount = courses.filter((c) => c.status === "Unpublish").length;

  const getColumns = () => {
    const baseColumns = [
      {
        key: "title",
        title: (
          <div className="flex items-center gap-2">
            Tiêu đề khóa học
            <button
              onClick={() => handleSort("title")}
              className="hover:text-blue-600"
            >
              <ArrowsUpDownIcon className="h-4 w-4" />
            </button>
          </div>
        ),
        render: (value, item) => (
          <div className="max-w-xs">
            <p className="font-medium text-gray-900 truncate">{value}</p>
            {item.description && (
              <p className="text-xs text-gray-500 truncate mt-1">
                {item.description}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "lecturerName",
        title: (
          <div className="flex items-center gap-2">
            Giảng viên
            <button
              onClick={() => handleSort("lecturerName")}
              className="hover:text-blue-600"
            >
              <ArrowsUpDownIcon className="h-4 w-4" />
            </button>
          </div>
        ),
      },
      {
        key: "subCategoryName",
        title: (
          <div className="flex items-center gap-2">
            Danh mục
            <button
              onClick={() => handleSort("subCategoryName")}
              className="hover:text-blue-600"
            >
              <ArrowsUpDownIcon className="h-4 w-4" />
            </button>
          </div>
        ),
      },
      {
        key: "enrollmentCount",
        title: "Học viên",
        render: (value) => (
          <span className="font-semibold text-gray-700">{value || 0}</span>
        ),
      },
      {
        key: "price",
        title: "Giá",
        render: (value) => (
          <span className="font-semibold text-green-600">
            {value === 0 ? "Miễn phí" : `${value.toLocaleString()} VND`}
          </span>
        ),
      },
    ];

    if (publishTab === "public") {
      return [
        ...baseColumns,
        {
          key: "status",
          title: "Trạng thái xuất bản",
          render: (value) => (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              {getPublishStatusText(value)}
            </span>
          ),
        },
        {
          key: "isActive",
          title: "Trạng thái",
          render: (value) => (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                value
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {value ? "Hoạt động" : "Bị cấm"}
            </span>
          ),
        },
        {
          key: "actions",
          title: "Hành động",
          render: (_, course) => (
            <Button
              variant={course.isActive ? "outline" : "default"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleBanUnban(course.id, course.isActive);
              }}
              className={`min-w-[80px] ${
                course.isActive
                  ? "border-red-300 text-red-600 hover:bg-red-50"
                  : "border border-green-500 text-green-600 bg-white hover:bg-green-50"
              }`}
            >
              {course.isActive ? "Cấm" : "Bỏ Cấm"}
            </Button>
          ),
        },
      ];
    } else if (publishTab === "pending") {
      // Pending tab columns
      return [
        ...baseColumns,
        {
          key: "status",
          title: "Trạng thái",
          render: (value) => (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
              {getPublishStatusText(value)}
            </span>
          ),
        },
        {
          key: "actions",
          title: "Hành động",
          render: (_, course) => (
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openReviewModal(course.id, true, course);
                }}
                className="min-w-[70px] bg-green-600 hover:bg-green-700"
              >
                Duyệt
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openReviewModal(course.id, false, course);
                }}
                className="min-w-[70px] border-red-300 text-red-600 hover:bg-red-50"
              >
                Từ chối
              </Button>
            </div>
          ),
        },
      ];
    } else {
      return [
        ...baseColumns,
        {
          key: "status",
          title: "Trạng thái",
          render: (value) => (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
              {getPublishStatusText(value)}
            </span>
          ),
        },
        {
          key: "isActive",
          title: "Trạng thái",
          render: (value) => (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                value
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {value ? "Hoạt động" : "Bị cấm"}
            </span>
          ),
        },
      ];
    }
  };

  const columns = getColumns();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý khóa học</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-xl shadow-sm border-b">
          <div className="flex gap-1 p-1">
            <button
              onClick={() => {
                setPublishTab("public");
                setCurrentPage(1);
              }}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                publishTab === "public"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Đã công khai
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  publishTab === "public"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {publicCount}
              </span>
            </button>
            <button
              onClick={() => {
                setPublishTab("pending");
                setCurrentPage(1);
              }}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                publishTab === "pending"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Đang chờ duyệt
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  publishTab === "pending"
                    ? "bg-amber-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {pendingCount}
              </span>
            </button>
            <button
              onClick={() => {
                setPublishTab("unpublish");
                setCurrentPage(1);
              }}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                publishTab === "unpublish"
                  ? "bg-gray-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Chưa xuất bản
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  publishTab === "unpublish"
                    ? "bg-gray-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {unpublishCount}
              </span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề, giảng viên, danh mục..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Ban Status Filter - Only show for Public tab */}
            {publishTab === "public" && (
              <div className="w-full lg:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <FunnelIcon className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả khóa học</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="banned">Đã bị cấm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Clear Filters */}
            {(searchTerm ||
              (publishTab === "public" && statusFilter !== "all")) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-600">
            Đang hiện {paginatedCourses.length} / {sortedCourses.length} khóa
            học
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-b-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="p-3 whitespace-nowrap">
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginatedCourses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center text-gray-400 py-8"
                    >
                      {publishTab === "pending"
                        ? "Không có khóa học nào đang chờ duyệt"
                        : publishTab === "unpublish"
                        ? "Không có khóa học nào chưa xuất bản"
                        : "Không tìm thấy khóa học"}
                    </td>
                  </tr>
                ) : (
                  paginatedCourses.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className="p-3">
                          {col.render
                            ? col.render(course[col.key], course)
                            : course[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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

              {/* Page numbers */}
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Show first, last, current, and adjacent pages
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    Math.abs(pageNumber - currentPage) <= 1
                  ) {
                    return (
                      <Button
                        key={pageNumber}
                        variant={
                          currentPage === pageNumber ? "default" : "outline"
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
      </div>

      {/* Course Review Modal - Compact Version */}
      {reviewModal.open && reviewModal.courseData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4 backdrop-blur">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            {/* Header */}
            <div
              className={`relative px-6 py-4 ${
                reviewModal.decision
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                  : "bg-gradient-to-r from-orange-500 to-red-500"
              } text-white rounded-t-xl`}
            >
              <button
                onClick={closeReviewModal}
                className="absolute top-3 right-3 p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
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
                    {reviewModal.decision
                      ? "Duyệt khóa học"
                      : "Từ chối khóa học"}
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
                    <p className="text-xs text-gray-500 font-medium">
                      Giảng viên
                    </p>
                  </div>
                  <p className="font-bold text-sm text-gray-900 truncate">
                    {reviewModal.courseData.lecturerName || "N/A"}
                  </p>
                </div>

                {/* Category */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TagIcon className="h-4 w-4 text-gray-600" />
                    <p className="text-xs text-gray-500 font-medium">
                      Danh mục
                    </p>
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
                  onClick={closeReviewModal}
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
      )}
    </div>
  );
}
