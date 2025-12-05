// src/pages/contentmoderator/CourseReportTab.jsx
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
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BookOpenIcon,
  UserIcon,
  ArrowLeftIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Spin } from "antd";
import { toast } from "react-toastify";
import { updateCourseReportStatus } from "@/api/courseReportAPI";
import dayjs from "dayjs";

export default function CourseReportTab({
  reports: groupedReports,
  fetchReports,
}) {
  const [selectedCourseGroup, setSelectedCourseGroup] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, resolved

  // Flatten the grouped reports structure
  const courseGroups =
    Array.isArray(groupedReports) && Array.isArray(groupedReports[0])
      ? groupedReports[0]
      : [];

  const handleResolve = async (reportId, status) => {
    try {
      setResolveLoading(true);
      await updateCourseReportStatus(reportId, status);

      toast.success("Xử lý báo cáo thành công!");
      setSelectedReport(null);
      setSelectedCourseGroup(null);
      fetchReports();
    } catch (error) {
      console.error("Error resolving report:", error);
      toast.error("Xử lý báo cáo thất bại!");
    } finally {
      setResolveLoading(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: ClockIcon,
        text: "Chờ xử lý",
      },
      Accepted: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircleIcon,
        text: "Đã chấp nhận",
      },
      Rejected: {
        color: "bg-red-100 text-red-800",
        icon: XCircleIcon,
        text: "Đã từ chối",
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1. 5 px-3 py-1.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="h-3. 5 w-3.5" />
        {config.text}
      </span>
    );
  };

  // Filter course groups by search and status
  const filteredCourseGroups = courseGroups.filter((group) => {
    const matchesSearch = group.courseName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && group.pendingCount > 0) ||
      (statusFilter === "resolved" && group.pendingCount === 0);

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCourseGroups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourseGroups = filteredCourseGroups.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  // Individual Report Detail View
  if (selectedReport) {
    return (
      <div className="bg-white rounded-b-xl shadow-sm">
        {/* Back Button */}
        <div className="p-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedReport(null)}
            className="gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại danh sách báo cáo
          </Button>
        </div>

        {/* Report Detail */}
        <div className="p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Chi tiết báo cáo
                </h2>
              </div>
              <StatusBadge status={selectedReport.status} />
            </div>

            {/* Course Info */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpenIcon className="h-5 w-5 text-red-700" />
                    <span className="text-sm font-medium text-red-700">
                      Khóa học bị báo cáo:
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {selectedReport.courseName}
                  </h3>
                </div>
              </div>
            </div>

            {/* Reporter Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon className="h-5 w-5 text-gray-600" />
                  <label className="text-sm font-medium text-gray-700">
                    Người báo cáo
                  </label>
                </div>
                <p className="text-gray-900 font-medium">
                  {selectedReport.studentName}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="h-5 w-5 text-gray-600" />
                  <label className="text-sm font-medium text-gray-700">
                    Ngày báo cáo
                  </label>
                </div>
                <p className="text-gray-900 font-medium">
                  {dayjs(selectedReport.createdAt).format("DD/MM/YYYY HH:mm")}
                </p>
              </div>
            </div>

            {/* Report Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do báo cáo
              </label>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {selectedReport.description}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedReport.status === "Pending" ? (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => handleResolve(selectedReport.id, "Accepted")}
                  disabled={resolveLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {resolveLoading ? (
                    <Spin size="small" />
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Chấp nhận báo cáo
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleResolve(selectedReport.id, "Rejected")}
                  disabled={resolveLoading}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  size="lg"
                >
                  {resolveLoading ? (
                    <Spin size="small" />
                  ) : (
                    <>
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Từ chối báo cáo
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div
                className={`p-4 rounded-lg text-sm font-medium ${
                  selectedReport.status === "Accepted"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedReport.status === "Accepted" ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    <XCircleIcon className="h-5 w-5" />
                  )}
                  <span>
                    Báo cáo này đã được xử lý:{" "}
                    {selectedReport.status === "Accepted"
                      ? "Chấp nhận"
                      : "Từ chối"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Course Group Detail View (List of reports for a course)
  if (selectedCourseGroup) {
    return (
      <div className="bg-white rounded-b-xl shadow-sm">
        {/* Back Button */}
        <div className="p-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCourseGroup(null)}
            className="gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại danh sách khóa học
          </Button>
        </div>

        {/* Course Group Header */}
        <div className="p-6 border-b bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedCourseGroup.courseName}
                </h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">
                    Tổng số báo cáo:{" "}
                    <span className="font-semibold text-gray-900">
                      {selectedCourseGroup.totalCount}
                    </span>
                  </span>
                  <span className="text-yellow-600">
                    Chờ xử lý:{" "}
                    <span className="font-semibold">
                      {selectedCourseGroup.pendingCount}
                    </span>
                  </span>
                  <span className="text-green-600">
                    Đã xử lý:{" "}
                    <span className="font-semibold">
                      {selectedCourseGroup.resolvedCount}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Danh sách báo cáo ({selectedCourseGroup.reports.length})
            </h3>
            <div className="space-y-3">
              {selectedCourseGroup.reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {report.studentName}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">
                          {dayjs(report.createdAt).format("DD/MM/YYYY HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {report.description}
                      </p>
                    </div>
                    <StatusBadge status={report.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Course Groups List View
  return (
    <>
      {/* Search and Filters */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Có báo cáo chờ xử lý</SelectItem>
              <SelectItem value="resolved">Đã xử lý hết</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || statusFilter !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {filteredCourseGroups.length} khóa học bị báo cáo
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

      {/* Course Groups List */}
      <div className="bg-white rounded-b-xl shadow-sm">
        {paginatedCourseGroups.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            Không có báo cáo nào
          </div>
        ) : (
          <div className="divide-y">
            {paginatedCourseGroups.map((group) => (
              <div
                key={group.courseId}
                onClick={() => setSelectedCourseGroup(group)}
                className="p-4 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex gap-4 items-start">
                  {" "}
                  {/* Add items-start here */}
                  {/* Warning Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  {/* Course Group Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                          {group.courseName}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
                          {" "}
                          {/* Add flex-wrap */}
                          <span className="text-gray-600">
                            Tổng:{" "}
                            <span className="font-semibold">
                              {group.totalCount}
                            </span>
                          </span>
                          {group.pendingCount > 0 && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              {group.pendingCount} chờ xử lý
                            </span>
                          )}
                          {group.resolvedCount > 0 && (
                            <span className="text-green-600">
                              {group.resolvedCount} đã xử lý
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {" "}
                        {/* Wrap the status badge */}
                        {group.pendingCount > 0 ? (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold whitespace-nowrap">
                            Cần xử lý
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold whitespace-nowrap">
                            Đã xử lý
                          </span>
                        )}
                      </div>
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
    </>
  );
}