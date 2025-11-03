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
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";
import { courseAPI } from "@/api/courseAPI";
import Table from "@/components/common/Table";

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [publishFilter, setPublishFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
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
    // 1. Update UI immediately (optimistic update)
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === courseId
          ? { ...course, isActive: !isCurrentlyActive }
          : course
      )
    );

    try {
      // 2. Make API call
      await courseAPI.banUnbanCourse(courseId);
      toast.success(
        `${isCurrentlyActive ? "Cấm" : "Bỏ cấm"} khóa học thành công!`
      );
    } catch (error) {
      // 3. If API fails, revert the change
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

    const matchesPublish =
      publishFilter === "all" ||
      (publishFilter === "public" && course.status === "Public") ||
      (publishFilter === "unpublish" && course.status === "Unpublish");

    return matchesSearch && matchesStatus && matchesPublish;
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
        return "Chưa xuất bản";
      default:
        return status;
    }
  };

  // Table columns with sort functionality
  const columns = [
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
      key: "rating",
      title: "Đánh giá",
      render: (value) => (
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span className="font-semibold">{value?.toFixed(1) || "0.0"}</span>
        </div>
      ),
    },
    {
      key: "price",
      title: "Giá",
      render: (value) => (
        <span className="font-semibold text-green-600">
          {value === 0 ? "Miễn phí" : `$${value}`}
        </span>
      ),
    },
    {
      key: "status",
      title: "Trạng thái xuất bản",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value === "Public"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
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
            value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
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
          variant={course.isActive ? "destructive" : "default"}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleBanUnban(course.id, course.isActive);
          }}
          className="min-w-[80px]"
        >
          {course.isActive ? "Cấm" : "Bỏ Cấm"}
        </Button>
      ),
    },
  ];

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

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
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

            {/* Ban Status Filter */}
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

            {/* Publish Status Filter */}
            <div className="w-full lg:w-48">
              <Select value={publishFilter} onValueChange={setPublishFilter}>
                <SelectTrigger>
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Lọc xuất bản" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="public">Công khai</SelectItem>
                  <SelectItem value="unpublish">Chưa xuất bản</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(searchTerm ||
              statusFilter !== "all" ||
              publishFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPublishFilter("all");
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                      Không tìm thấy khóa học
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
    </div>
  );
}
