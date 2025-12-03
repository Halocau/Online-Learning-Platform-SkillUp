// src/pages/contentmoderator/CourseReportTab.jsx
import React, { useState } from "react";
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
} from "@heroicons/react/24/outline";
import { Spin } from "antd";
import { toast } from "react-toastify";
import { updateCourseReportStatus } from "@/api/courseReportAPI";
import dayjs from "dayjs";

export default function CourseReportTab({ reports, fetchReports }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleResolve = async (status) => {
    if (!selectedReport) return;

    try {
      setResolveLoading(true);
      await updateCourseReportStatus(selectedReport.id, status);

      toast.success("Xử lý báo cáo thành công!");
      setSelectedReport(null);
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
        className={`inline-flex items-center gap-1 px-2. 5 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="h-3. 5 w-3.5" />
        {config.text}
      </span>
    );
  };

  // Filter reports by search
  const filteredReports = reports.filter(
    (report) =>
      report.courseName?. toLowerCase().includes(searchTerm. toLowerCase()) ||
      report.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to page 1 when search or items per page changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // Detail View
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
            Quay lại danh sách
          </Button>
        </div>

        {/* Report Detail */}
        <div className="p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Chi tiết báo cáo khóa học
                </h2>
              </div>
              <StatusBadge status={selectedReport. status} />
            </div>

            {/* Course Info with Image */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-start gap-3">
                {/* Course Image */}
                <div className="w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {selectedReport.courseImage ? (
                    <img
                      src={selectedReport.courseImage}
                      alt={selectedReport.courseName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpenIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
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
                  {selectedReport. studentName}
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
            {selectedReport.status === "Pending" ?  (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => handleResolve("Accepted")}
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
                  onClick={() => handleResolve("Rejected")}
                  disabled={resolveLoading}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  size="lg"
                >
                  {resolveLoading ?  (
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

  // List View
  return (
    <>
      {/* Search */}
      <div className="bg-white p-4 shadow-sm">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm báo cáo theo khóa học, người báo cáo, lý do..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {filteredReports.length} báo cáo
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hiển thị:</span>
            <Select
              value={itemsPerPage. toString()}
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

      {/* Reports List */}
      <div className="bg-white rounded-b-xl shadow-sm">
        {paginatedReports.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            Không có báo cáo nào
          </div>
        ) : (
          <div className="divide-y">
            {paginatedReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="p-4 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex gap-4">
                  {/* Course Image */}
                  <div className="w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {report.courseImage ? (
                      <img
                        src={report.courseImage}
                        alt={report.courseName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpenIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Report Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                          {report. courseName}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                          {report. description}
                        </p>
                      </div>
                      <StatusBadge status={report.status} />
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <UserIcon className="h-4 w-4" />
                        {report.studentName}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        {dayjs(report.createdAt).format("DD/MM/YYYY HH:mm")}
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