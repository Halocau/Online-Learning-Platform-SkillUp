// src/pages/contentmoderator/CourseReportTab.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BookOpenIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Spin } from "antd";
import { toast } from "react-toastify";
import { getAllCourseReports, updateCourseReportStatus } from "@/api/courseReportAPI";
import dayjs from "dayjs";

export default function CourseReportTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getAllCourseReports();
      // Handle the double-wrapped array from API
      const data = Array.isArray(response) && Array.isArray(response[0])
        ? response[0]
        : response;
      setReports(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách báo cáo khóa học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (status) => {
    if (!selectedReport) return;

    try {
      setResolveLoading(true);
      await updateCourseReportStatus(selectedReport.id, status);

      // Update local data
      setReports((prevData) =>
        prevData.map((item) =>
          item.id === selectedReport.id ?  { ...item, status } : item
        )
      );

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
      report.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

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
        <div className="mt-3 text-sm text-gray-600">
          {filteredReports. length} báo cáo
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-b-xl shadow-sm">
        {filteredReports.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            Không có báo cáo nào
          </div>
        ) : (
          <div className="divide-y">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="p-4 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                  </div>

                  {/* Report Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                          {report.courseName}
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
    </>
  );
}