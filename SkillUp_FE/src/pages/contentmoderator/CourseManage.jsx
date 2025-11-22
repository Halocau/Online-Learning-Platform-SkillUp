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
  ClockIcon,
  TagIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";
import { courseAPI } from "@/api/courseAPI";

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải khóa học...</div>
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

      {/* Course Review Modal */}
      {reviewModal.open && reviewModal.courseData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-white-70 ">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div
              className={`relative p-6 ${
                reviewModal.decision
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : "bg-gradient-to-r from-red-500 to-rose-600"
              } text-white rounded-t-2xl`}
            >
              <button
                onClick={closeReviewModal}
                className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              <div className="flex items-center gap-4">
                <div
                  className={`p-4 rounded-full ${
                    reviewModal.decision
                      ? "bg-green-400 bg-opacity-30"
                      : "bg-red-400 bg-opacity-30"
                  }`}
                >
                  {reviewModal.decision ? (
                    <CheckCircleIcon className="h-12 w-12" />
                  ) : (
                    <XCircleIcon className="h-12 w-12" />
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-1">
                    {reviewModal.decision
                      ? "Duyệt khóa học"
                      : "Từ chối khóa học"}
                  </h2>
                  <p className="text-green-50 text-sm">
                    {reviewModal.decision
                      ? "Xác nhận phê duyệt và xuất bản khóa học này"
                      : "Cung cấp lý do từ chối để giảng viên có thể cải thiện"}
                  </p>
                </div>
              </div>
            </div>

            {/* Course Information */}
            <div className="p-6 space-y-6">
              {/* Course Title & Description */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3 mb-3">
                  <BookOpenIcon className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {reviewModal.courseData.title}
                    </h3>
                    {reviewModal.courseData.description && (
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {reviewModal.courseData.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Lecturer Information */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <AcademicCapIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      Giảng viên
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {reviewModal.courseData.lecturerName ||
                        "Chưa có thông tin"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Category */}
                <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition">
                  <div className="flex items-center gap-2 mb-2">
                    <TagIcon className="h-5 w-5 text-blue-500" />
                    <p className="text-xs text-gray-500 font-medium">
                      Danh mục
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 truncate">
                    {reviewModal.courseData.subCategoryName || "N/A"}
                  </p>
                </div>

                {/* Price */}
                <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-green-200 transition">
                  <div className="flex items-center gap-2 mb-2">
                    <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                    <p className="text-xs text-gray-500 font-medium">Giá</p>
                  </div>
                  <p className="font-bold text-green-600">
                    {reviewModal.courseData.price === 0
                      ? "Miễn phí"
                      : `${reviewModal.courseData.price.toLocaleString()} VND`}
                  </p>
                </div>

                {/* Status */}
                <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-purple-200 transition">
                  <div className="flex items-center gap-2 mb-2">
                    <ClockIcon className="h-5 w-5 text-purple-500" />
                    <p className="text-xs text-gray-500 font-medium">
                      Trạng thái
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                    {getPublishStatusText(reviewModal.courseData.status)}
                  </span>
                </div>
              </div>

              {/* Feedback Form */}
              <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                <label className="block mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <InformationCircleIcon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      {reviewModal.decision
                        ? "Phản hồi cho giảng viên"
                        : "Lý do từ chối (Bắt buộc) *"}
                    </span>
                  </div>
                  <Textarea
                    placeholder={
                      reviewModal.decision
                        ? "Nhận xét phê duyệt,... "
                        : "Lí do từ chối phê duyệt"
                    }
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={6}
                    className={`resize-none text-sm ${
                      !reviewModal.decision && !feedback.trim()
                        ? "border-red-300 focus:border-red-500"
                        : ""
                    }`}
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={closeReviewModal}
                  disabled={isSubmitting}
                  className="flex-1 h-12 text-base font-semibold"
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={
                    isSubmitting || (!reviewModal.decision && !feedback.trim())
                  }
                  className={`flex-1 h-12 text-base font-semibold ${
                    reviewModal.decision
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
