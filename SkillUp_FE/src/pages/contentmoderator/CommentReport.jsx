// src/pages/contentmoderator/CommentReport.jsx
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
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Modal } from "antd";
import Table from "@/components/common/Table";
import { getAllReports, resolveReport } from "@/api/commentReport";
import dayjs from "dayjs";
import { toast } from "sonner";

export default function CommentReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resolveLoading, setResolveLoading] = useState(false);

  const itemsPerPage = 10;

  const fetchReports = async () => {
    try {
      setLoading(true);
      const reports = await getAllReports();
      setData(reports);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách báo cáo");
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

  const handleResolve = async (shouldDeleteComment) => {
    if (!selectedReport) return;

    try {
      setResolveLoading(true);
      await resolveReport(selectedReport.id, shouldDeleteComment);

      // Update local data
      setData((prevData) =>
        prevData.map((item) =>
          item.id === selectedReport.id
            ? { ...item, status: shouldDeleteComment ? "Accepted" : "Rejected" }
            : item
        )
      );

      setIsModalOpen(false);
      toast.success(
        shouldDeleteComment
          ? "Chấp nhận báo cáo và xóa bình luận thành công!"
          : "Từ chối báo cáo thành công!"
      );
    } catch (err) {
      toast.error("Xử lý báo cáo thất bại!");
    } finally {
      setResolveLoading(false);
    }
  };

  // Filter and search logic
  const filteredData = data.filter((report) => {
    const matchesSearch =
      report.reporterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sorting logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue = a[sortColumn];
    let bValue = b[sortColumn];

    // Handle date sorting
    if (sortColumn === "createdAt") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else {
      aValue = aValue?.toString().toLowerCase() || "";
      bValue = bValue?.toString().toLowerCase() || "";
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  // Handle sorting
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // Status badge component
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

  const columns = [
    {
      key: "reporterName",
      title: (
        <div className="flex items-center gap-2">
          Người báo cáo
          <button
            onClick={() => handleSort("reporterName")}
            className="hover:text-blue-600"
          >
            <ArrowsUpDownIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
    {
      key: "reason",
      title: "Lý do báo cáo",
      render: (value) => (
        <p className="max-w-[300px] truncate" title={value}>
          {value}
        </p>
      ),
    },
    {
      key: "status",
      title: (
        <div className="flex items-center gap-2">
          Trạng thái
          <button
            onClick={() => handleSort("status")}
            className="hover:text-blue-600"
          >
            <ArrowsUpDownIcon className="h-4 w-4" />
          </button>
        </div>
      ),
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "createdAt",
      title: (
        <div className="flex items-center gap-2">
          Ngày báo cáo
          <button
            onClick={() => handleSort("createdAt")}
            className="hover:text-blue-600"
          >
            <ArrowsUpDownIcon className="h-4 w-4" />
          </button>
        </div>
      ),
      render: (value) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    },
  ];

  // Statistics
  const stats = {
    total: data.length,
    pending: data.filter((r) => r.status === "Pending").length,
    accepted: data.filter((r) => r.status === "Accepted").length,
    rejected: data.filter((r) => r.status === "Rejected").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải báo cáo...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Quản lý báo cáo bình luận
          </h2>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên người báo cáo hoặc lý do..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Pending">Chờ xử lý</SelectItem>
                  <SelectItem value="Accepted">Đã chấp nhận</SelectItem>
                  <SelectItem value="Rejected">Đã từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== "all") && (
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
            Đang hiện {paginatedData.length} / {sortedData.length} báo cáo
          </div>
        </div>

        {/* Table */}
        <Table columns={columns} data={paginatedData} onRowClick={handleView} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm gap-4">
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

        {/* Report Detail & Resolve Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Chi tiết báo cáo</span>
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
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Người báo cáo:
                </label>
                <p className="mt-1 text-gray-900">
                  {selectedReport.reporterName}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Lý do báo cáo:
                </label>
                <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedReport.reason}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Ngày báo cáo:
                </label>
                <p className="mt-1 text-gray-900">
                  {dayjs(selectedReport.createdAt).format(
                    "DD/MM/YYYY HH:mm:ss"
                  )}
                </p>
              </div>

              {/* Action buttons - only show for Pending status */}
              {selectedReport.status === "Pending" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleResolve(true)}
                    disabled={resolveLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Chấp nhận & Xóa bình luận
                  </Button>
                  <Button
                    onClick={() => handleResolve(false)}
                    disabled={resolveLoading}
                    variant="outline"
                    className="flex-1"
                  >
                    <XCircleIcon className="h-4 w-4 mr-2" />
                    Từ chối báo cáo
                  </Button>
                </div>
              )}

              {/* Show status message for resolved reports */}
              {selectedReport.status !== "Pending" && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    selectedReport.status === "Accepted"
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  Báo cáo này đã được xử lý:{" "}
                  {selectedReport.status === "Accepted"
                    ? "Chấp nhận và xóa bình luận"
                    : "Từ chối"}
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
