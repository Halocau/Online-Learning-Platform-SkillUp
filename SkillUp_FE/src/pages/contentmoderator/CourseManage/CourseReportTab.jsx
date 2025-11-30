// src/pages/contentmoderator/CourseReportTab.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { Modal, Spin } from "antd";
import { toast } from "react-toastify";
import { getAllCourseReports, updateCourseReportStatus } from "@/api/courseReportAPI";
import dayjs from "dayjs";

export default function CourseReportTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resolveLoading, setResolveLoading] = useState(false);

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

  const handleView = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleResolve = async (status) => {
    if (!selectedReport) return;

    try {
      setResolveLoading(true);
      await updateCourseReportStatus(selectedReport.id, status);

      // Update local data
      setReports((prevData) =>
        prevData.map((item) =>
          item.id === selectedReport.id ? { ...item, status } : item
        )
      );

      setIsModalOpen(false);
      toast.success("Xử lý báo cáo thành công!");
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
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-3 whitespace-nowrap">Khóa học</th>
                <th className="p-3 whitespace-nowrap">Người báo cáo</th>
                <th className="p-3 whitespace-nowrap">Lý do</th>
                <th className="p-3 whitespace-nowrap">Trạng thái</th>
                <th className="p-3 whitespace-nowrap">Ngày báo cáo</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center text-gray-400 py-8"
                  >
                    Không có báo cáo nào
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => handleView(report)}
                  >
                    <td className="p-3">
                      <p className="font-medium text-gray-900 max-w-xs truncate">
                        {report.courseName || "N/A"}
                      </p>
                    </td>
                    <td className="p-3">{report.studentName || "N/A"}</td>
                    <td className="p-3">
                      <p className="max-w-[300px] truncate" title={report.description}>
                        {report.description}
                      </p>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="p-3">
                      {dayjs(report.createdAt).format("DD/MM/YYYY HH:mm")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Chi tiết báo cáo khóa học</span>
            {selectedReport && <StatusBadge status={selectedReport.status} />}
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedReport && (
          <div className="space-y-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-start gap-2">
                <BookOpenIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base mb-1">
                    {selectedReport.courseName}
                  </h3>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Người báo cáo:
              </label>
              <p className="mt-1 text-gray-900">
                {selectedReport.studentName}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Lý do báo cáo:
              </label>
              <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">
                {selectedReport.description}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Ngày báo cáo:
              </label>
              <p className="mt-1 text-gray-900">
                {dayjs(selectedReport.createdAt).format("DD/MM/YYYY HH:mm:ss")}
              </p>
            </div>

            {/* Action buttons - only show for Pending status */}
            {selectedReport.status === "Pending" && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => handleResolve("Accepted")}
                  disabled={resolveLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Chấp nhận báo cáo
                </Button>
                <Button
                  onClick={() => handleResolve("Rejected")}
                  disabled={resolveLoading}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  Từ chối báo cáo
                </Button>
              </div>
            )}

            {/* Show status message for resolved reports */}
            {selectedReport.status !== "Pending" && (
              <div
                className={`p-3 rounded-lg text-sm ${selectedReport.status === "Accepted"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                  }`}
              >
                Báo cáo này đã được xử lý:{" "}
                {selectedReport.status === "Accepted" ? "Chấp nhận" : "Từ chối"}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
