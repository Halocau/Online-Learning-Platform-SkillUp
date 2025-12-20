// src/pages/admin/AdminSalaryReport.jsx
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarIcon,
  BanknotesIcon,
  UserIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  EyeIcon,
  XMarkIcon,
  ShoppingCartIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Spin } from "antd";
import { adminAPI } from "@/api/adminAPI";
import { lecturerAPI } from "@/api/lecturerAPI";
import { toast } from "react-toastify";
import dayjs from "dayjs";

export default function AdminSalaryReport() {
  const currentDate = dayjs();
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentDate.month() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.year());
  const [salaryData, setSalaryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sorting
  const [sortBy, setSortBy] = useState("lecturerIncome");
  const [sortOrder, setSortOrder] = useState("desc");

  // Filtering
  const [filterStatus, setFilterStatus] = useState("all");

  // Platform fee editing
  const [editingPercentages, setEditingPercentages] = useState({});
  const [updatingLecturer, setUpdatingLecturer] = useState(null);

  // Payroll Details Modal
  const [selectedLecturerDetails, setSelectedLecturerDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const years = Array.from({ length: 6 }, (_, i) => currentDate.year() - i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: dayjs().month(i).format("MMMM"),
  }));

  useEffect(() => {
    fetchSalaryReport();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, sortBy, sortOrder]);

  const fetchSalaryReport = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getMonthlyPayrollReport(
        selectedMonth,
        selectedYear
      );

      if (
        response.data.code === 200 &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const reportData = Array.isArray(response.data.data[0])
          ? response.data.data[0]
          : response.data.data;
        setSalaryData(reportData);
      } else {
        setSalaryData([]);
        toast.info("Không có dữ liệu lương cho tháng này");
      }
    } catch (error) {
      console.error("Error loading salary report:", error);
      toast.error("Lỗi khi tải báo cáo lương");
      setSalaryData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    let data = [...salaryData];

    if (searchTerm) {
      data = data.filter(
        (item) =>
          item.lecturerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.receiverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.bankName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      if (filterStatus === "withIncome") {
        data = data.filter((item) => item.totalRevenue > 0);
      } else if (filterStatus === "noIncome") {
        data = data.filter((item) => item.totalRevenue === 0);
      } else if (filterStatus === "noBankInfo") {
        data = data.filter(
          (item) => !item.receiverName || !item.bankName || !item.bankNumber
        );
      } else if (filterStatus === "hasBankInfo") {
        data = data.filter(
          (item) => item.receiverName && item.bankName && item.bankNumber
        );
      }
    }

    return data;
  }, [salaryData, searchTerm, filterStatus]);

  const sortedData = useMemo(() => {
    let data = [...filteredData];

    data.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === "string") {
        aValue = aValue?.toLowerCase() || "";
        bValue = bValue?.toLowerCase() || "";
      }

      if (aValue == null) aValue = sortOrder === "asc" ? Infinity : -Infinity;
      if (bValue == null) bValue = sortOrder === "asc" ? Infinity : -Infinity;

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return data;
  }, [filteredData, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const totals = useMemo(
    () =>
      sortedData.reduce(
        (acc, item) => ({
          totalRevenue: acc.totalRevenue + (item.totalRevenue || 0),
          platformFee: acc.platformFee + (item.platformFee || 0),
          lecturerIncome: acc.lecturerIncome + (item.lecturerIncome || 0),
        }),
        { totalRevenue: 0, platformFee: 0, lecturerIncome: 0 }
      ),
    [sortedData]
  );

  const lecturersWithIncome = sortedData.filter(
    (item) => item.totalRevenue > 0
  ).length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };
  const exportToCSV = () => {
    const headers = [
      "STT",
      "Giảng viên",
      "Người nhận",
      "Ngân hàng",
      "Số tài khoản",
      "Tổng doanh thu",
      "Phí nền tảng (40%)",
      "Thu nhập ròng",
    ];

    const csvContent = [
      headers.join(","),
      ...sortedData.map((item, index) =>
        [
          index + 1,
          item.lecturerName || "",
          item.receiverName || "Chưa cập nhật",
          item.bankName || "Chưa cập nhật",
          item.bankNumber || "Chưa cập nhật",
          item.totalRevenue || 0,
          item.platformFee || 0,
          item.lecturerIncome || 0,
        ].join(",")
      ),
      "",
      `Tổng cộng,,,,${totals.totalRevenue},${totals.platformFee},${totals.lecturerIncome}`,
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `salary-report-${selectedMonth}-${selectedYear}.csv`;
    link.click();

    toast.success("Xuất báo cáo thành công!");
  };
  const handleViewDetails = (lecturer) => {
    setSelectedLecturerDetails(lecturer);
    setIsDetailsModalOpen(true);
  };

  const SortButton = ({ column, label }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 hover:text-blue-600 transition"
    >
      {label}
      <ArrowsUpDownIcon
        className={`w-4 h-4 ${
          sortBy === column ? "text-blue-600" : "text-gray-400"
        }`}
      />
    </button>
  );

  const handlePercentageChange = (lecturerId, value) => {
    const numValue = parseFloat(value);
    if (
      value === "" ||
      (!isNaN(numValue) && numValue >= 0 && numValue <= 100)
    ) {
      setEditingPercentages((prev) => ({
        ...prev,
        [lecturerId]: value,
      }));
    }
  };

  const handleUpdatePercentage = async (lecturerId, currentPercentage) => {
    const newPercentage = editingPercentages[lecturerId];

    if (!newPercentage || newPercentage === "") {
      toast.warning("Vui lòng nhập phần trăm hợp lệ");
      return;
    }

    const numPercentage = parseFloat(newPercentage);
    if (isNaN(numPercentage) || numPercentage < 0 || numPercentage > 100) {
      toast.error("Phần trăm phải từ 0 đến 100");
      return;
    }

    if (numPercentage === currentPercentage) {
      toast.info("Không có thay đổi");
      return;
    }

    try {
      setLoading(true);
      setUpdatingLecturer(lecturerId);
      await lecturerAPI.updateLecturerPercentage(lecturerId, numPercentage);
      toast.success("Cập nhật phần trăm thành công!");

      setEditingPercentages((prev) => {
        const newState = { ...prev };
        delete newState[lecturerId];
        return newState;
      });

      await fetchSalaryReport();
    } catch (error) {
      console.error("Error updating percentage:", error);
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật phần trăm"
      );
    } finally {
      setUpdatingLecturer(null);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Báo cáo lương giảng viên
            </h2>
            <p className="text-gray-600 mt-1">
              Quản lý và theo dõi chi tiết lương giảng viên theo tháng
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-40">
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem
                      key={month.value}
                      value={month.value.toString()}
                    >
                      Tháng {month.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-32">
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Năm" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={exportToCSV}
              disabled={sortedData.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Xuất Excel
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-orange-100 text-sm font-medium">
                Phí nền tảng
              </p>
              <BanknotesIcon className="w-8 h-8 text-orange-200" />
            </div>
            <p className="text-3xl font-bold">
              {formatCurrency(totals.platformFee)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-green-100 text-sm font-medium">
                Thu nhập ròng
              </p>
              <BanknotesIcon className="w-8 h-8 text-green-200" />
            </div>
            <p className="text-3xl font-bold">
              {formatCurrency(totals.lecturerIncome)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-100 text-sm font-medium">
                Giảng viên có thu nhập
              </p>
              <UserIcon className="w-8 h-8 text-purple-200" />
            </div>
            <p className="text-3xl font-bold">
              {lecturersWithIncome}/{sortedData.length}
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên giảng viên, người nhận, ngân hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="w-full lg:w-56">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <FunnelIcon className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="withIncome">Có thu nhập</SelectItem>
                  <SelectItem value="noIncome">Không có thu nhập</SelectItem>
                  <SelectItem value="hasBankInfo">
                    Đã cập nhật ngân hàng
                  </SelectItem>
                  <SelectItem value="noBankInfo">
                    Chưa cập nhật ngân hàng
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full lg:w-40">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / trang</SelectItem>
                  <SelectItem value="20">20 / trang</SelectItem>
                  <SelectItem value="50">50 / trang</SelectItem>
                  <SelectItem value="100">100 / trang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Hiển thị {paginatedData.length > 0 ? startIndex + 1 : 0}-
              {Math.min(endIndex, sortedData.length)} / {sortedData.length}{" "}
              giảng viên
            </span>
            {(searchTerm || filterStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                className="text-blue-600 hover: text-blue-700 font-medium"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : sortedData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không có dữ liệu
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== "all"
                ? "Không tìm thấy kết quả phù hợp"
                : `Không có dữ liệu lương cho tháng ${selectedMonth}/${selectedYear}`}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <SortButton column="lecturerName" label="Giảng viên" />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Thông tin nhận tiền
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <SortButton
                          column="totalRevenue"
                          label="Tổng doanh thu"
                        />
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <SortButton column="platformFee" label="Phí nền tảng" />
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <SortButton
                          column="lecturerIncome"
                          label="Thu nhập ròng"
                        />
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedData.map((item, index) => (
                      <tr
                        key={item.lecturerId}
                        className={`hover:bg-gray-50 transition ${
                          item.totalRevenue === 0 ? "opacity-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="flex items-center gap-3 hover:opacity-80 transition text-left"
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 hover:text-blue-600 transition">
                                {item.lecturerName}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {item.lecturerId.slice(0, 8)}...
                              </p>
                            </div>
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          {item.receiverName &&
                          item.bankName &&
                          item.bankNumber ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <UserIcon className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-900">
                                  {item.receiverName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <BuildingLibraryIcon className="w-4 h-4 text-gray-400" />
                                <span>{item.bankName}</span>
                              </div>
                              <div className="text-sm text-gray-600 font-mono">
                                {item.bankNumber}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg inline-flex items-center gap-2">
                              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                              Chưa cập nhật thông tin
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span
                            className={`font-semibold ${
                              item.totalRevenue > 0
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                          >
                            {formatCurrency(item.totalRevenue)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-orange-600 font-semibold">
                              {formatCurrency(item.platformFee)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span
                            className={`font-bold text-lg ${
                              item.lecturerIncome > 0
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          >
                            {formatCurrency(item.lecturerIncome)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(item)}
                              className="h-8 px-3"
                            >
                              <EyeIcon className="w-4 h-4 mr-1" />
                              Chi tiết
                            </Button>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={
                                  editingPercentages[item.lecturerId] ??
                                  (item.currentPercentage || 40)
                                }
                                onChange={(e) =>
                                  handlePercentageChange(
                                    item.lecturerId,
                                    e.target.value
                                  )
                                }
                                className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                                placeholder="%"
                              />
                              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                                %
                              </span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdatePercentage(
                                  item.lecturerId,
                                  item.currentPercentage || 40
                                )
                              }
                              disabled={updatingLecturer === item.lecturerId}
                              className="bg-blue-600 hover:bg-blue-700 h-8 px-3"
                            >
                              {updatingLecturer === item.lecturerId ? (
                                <Spin size="small" className="text-white" />
                              ) : (
                                <>
                                  <CheckIcon className="w-4 h-4 mr-1" />
                                  Lưu
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-4 text-right font-bold text-gray-900 uppercase"
                      >
                        Tổng cộng:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-bold text-lg text-blue-600">
                          {formatCurrency(totals.totalRevenue)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-bold text-lg text-orange-600">
                          {formatCurrency(totals.platformFee)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-bold text-xl text-green-600">
                          {formatCurrency(totals.lecturerIncome)}
                        </span>
                      </td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

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
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeftIcon className="w-4 h-4 mr-1" />
                    Trước
                  </Button>

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
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
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
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Payroll Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div>{selectedLecturerDetails?.lecturerName}</div>
                <div className="text-sm text-gray-500 font-normal">
                  Chi tiết giao dịch tháng {selectedMonth}/{selectedYear}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedLecturerDetails && (
            <div className="space-y-6">
              {/* Summary Section */}
              <div className="grid grid-cols-1 md: grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Tổng doanh thu
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(selectedLecturerDetails.totalRevenue)}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-orange-600 font-medium mb-1">
                    Phí nền tảng
                  </p>
                  <p className="text-2xl font-bold text-orange-700">
                    {formatCurrency(selectedLecturerDetails.platformFee)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-medium mb-1">
                    Thu nhập ròng
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(selectedLecturerDetails.lecturerIncome)}
                  </p>
                </div>
              </div>

              {/* Transactions List */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ShoppingCartIcon className="w-5 h-5" />
                  Danh sách giao dịch (
                  {selectedLecturerDetails.payrollDetails?.length || 0})
                </h3>

                {selectedLecturerDetails.payrollDetails &&
                selectedLecturerDetails.payrollDetails.length > 0 ? (
                  <div className="space-y-3">
                    {selectedLecturerDetails.payrollDetails.map(
                      (detail, index) => (
                        <div
                          key={detail.transactionDetailId}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                        >
                          <div className="flex gap-4">
                            {/* Course Image */}
                            <div className="flex-shrink-0">
                              <img
                                src={detail.image}
                                alt={detail.courseTitle}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {detail.courseTitle}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    ID: {detail.courseId.slice(0, 8)}...
                                  </p>
                                </div>
                                <span className="text-lg font-bold text-blue-600">
                                  {formatCurrency(detail.coursePrice)}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <UserIcon className="w-4 h-4" />
                                  <span>Người mua: {detail.buyerEmail}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <ClockIcon className="w-4 h-4" />
                                  <span>
                                    {dayjs(detail.transactionDate).format(
                                      "DD/MM/YYYY HH:mm"
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">
                                    Phí nền tảng:
                                  </span>
                                  <span
                                    className={`font-semibold px-2 py-1 rounded ${
                                      detail.percentage === 0
                                        ? "bg-green-100 text-green-700"
                                        : detail.percentage >= 50
                                        ? "bg-red-100 text-red-700"
                                        : "bg-orange-100 text-orange-700"
                                    }`}
                                  >
                                    {detail.percentage}%
                                  </span>
                                </div>
                              </div>

                              {/* Calculation breakdown */}
                              <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Giá khóa học:
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(detail.coursePrice)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Phí nền tảng ({detail.percentage}%):
                                  </span>
                                  <span className="font-medium text-orange-600">
                                    -
                                    {formatCurrency(
                                      (detail.coursePrice * detail.percentage) /
                                        100
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-200">
                                  <span className="text-gray-900 font-semibold">
                                    Thu nhập giảng viên:
                                  </span>
                                  <span className="font-bold text-green-600">
                                    {formatCurrency(
                                      (detail.coursePrice *
                                        (100 - detail.percentage)) /
                                        100
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <ShoppingCartIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">
                      Không có giao dịch nào trong tháng này
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsDetailsModalOpen(false)}
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
