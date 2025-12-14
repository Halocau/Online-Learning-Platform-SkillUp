// src/pages/contentmod/BannerManage.jsx
import React, { useEffect, useState } from "react";
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
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { Image, Switch, Spin } from "antd";
import { PlusCircle } from "lucide-react";
import Table from "@/components/common/Table";
import axiosInstance from "@/lib/axios";
import { API_BASE_URL } from "@/config/api";
import { toast } from "react-toastify";
import BannerEditModal from "@/components/Banner/BannerEditModal";
import BannerCreateModal from "@/components/Banner/BannerCreateModal";

export default function BannerManage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${API_BASE_URL}/Banner/all-banners`
      );
      setData(response.data.data.flat());
    } catch (error) {
      console.error("Không thể lấy banners:", error);
      toast.error("Không thể tải danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleToggleActive = async (id, checked) => {
    // Optimistic update - update UI immediately
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, isActive: checked } : item
      )
    );

    try {
      await axiosInstance.put(
        `${API_BASE_URL}/Banner/toggle-banner`,
        null,
        {
          params: {
            isActive: checked,
            bannerId: id,
          },
        }
      );
      toast.success("Trạng thái banner đã được cập nhật.");
    } catch (error) {
      // Revert on error
      setData((prevData) =>
        prevData.map((item) =>
          item.id === id ? { ...item, isActive: !checked } : item
        )
      );
      toast.error(
        error.response?.data?.message || "Đã xảy ra lỗi.  Vui lòng thử lại."
      );
    }
  };

  const handleUpdateBanner = async (updatedBanner) => {
    try {
      await axiosInstance.put(
        `${API_BASE_URL}/Banner/update-banner`,
        updatedBanner,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Banner đã được cập nhật thành công.");
      setEditOpen(false);
      fetchBanners();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Đã xảy ra lỗi.  Vui lòng thử lại."
      );
    }
  };

  const handleCreateBanner = async (formData) => {
    try {
      await axiosInstance.post(
        `${API_BASE_URL}/Banner/create-banner`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Tạo banner thành công.");
      setCreateOpen(false);
      fetchBanners();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    }
  };

  // Filter logic
  const filteredData = data.filter((banner) => {
    const matchesSearch =
      banner.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && banner.isActive) ||
      (statusFilter === "inactive" && !banner.isActive);

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Define table columns
  const columns = [
    {
      key: "id",
      title: "ID",
      render: (value) => <span className="text-gray-700">{value}</span>,
    },
    {
      key: "image",
      title: "Ảnh",
      render: (value) => (
        <Image
          width={100}
          height={60}
          src={value}
          style={{ objectFit: "cover", borderRadius: "6px" }}
          alt="Banner Preview"
        />
      ),
    },
    {
      key: "title",
      title: "Chi tiết",
      render: (value, item) => (
        <div className="max-w-xs">
          <div className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {item.title}
          </div>
          <div className="text-sm text-gray-600 mb-2 line-clamp-2">
            {item.description}
          </div>
          {item.hyperlink && (
            <a
              href={item.hyperlink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline truncate block"
              onClick={(e) => e.stopPropagation()}
            >
              {item.hyperlink}
            </a>
          )}
        </div>
      ),
    },
    {
      key: "email",
      title: "Người tạo",
      render: (value) => <span className="text-gray-700">{value}</span>,
    },
    {
      key: "isActive",
      title: "Trạng thái",
      render: (value, item) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={value}
            onChange={(checked) => handleToggleActive(item.id, checked)}
            checkedChildren="Bật"
            unCheckedChildren="Tắt"
          />
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Quản lý Banner</h2>
            <p className="text-gray-600 text-sm mt-1">
              Quản lý banner trang chủ và khuyến mãi
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setCreateOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Thêm mới
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề, mô tả hoặc email..."
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
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Đang bật</SelectItem>
                  <SelectItem value="inactive">Đang tắt</SelectItem>
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

          {/* Results count and Items per page */}
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Đang hiện{" "}
              <span className="font-semibold">{paginatedData.length}</span> /{" "}
              <span className="font-semibold">{filteredData.length}</span>{" "}
              banner
            </div>

            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Hiển thị:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">mục/trang</span>
            </div>
          </div>
        </div>

        {/* Table - Using Reusable Component */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="p-3">
                      {col.title}
                    </th>
                  ))}
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="text-center text-gray-400 py-6"
                    >
                      Không tìm thấy dữ liệu
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className="p-3">
                          {col.render
                            ? col.render(item[col.key], item)
                            : item[col.key]}
                        </td>
                      ))}

                      <td
                        className="p-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setEditOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-white border border-blue-800 rounded hover:bg-blue-50 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Chỉnh sửa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200 gap-4">
            <div className="text-sm text-gray-600">
              Trang <span className="font-semibold">{currentPage}</span> /{" "}
              <span className="font-semibold">{totalPages}</span>
            </div>

            <div className="flex gap-2 flex-wrap justify-center items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="min-w-[80px]"
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
                        className="min-w-[40px]"
                      >
                        {pageNumber}
                      </Button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span
                        key={pageNumber}
                        className="px-2 py-1 text-gray-400"
                      >
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
                className="min-w-[80px]"
              >
                Sau
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredData.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy banner
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "Thử điều chỉnh bộ lọc hoặc tìm kiếm của bạn"
                : "Chưa có banner nào được tạo"}
            </p>
          </div>
        )}

        <BannerEditModal
          visible={editOpen}
          editingBanner={editingItem}
          onCancel={() => setEditOpen(false)}
          onUpdate={handleUpdateBanner}
        />

        <BannerCreateModal
          visible={createOpen}
          onCancel={() => setCreateOpen(false)}
          onCreate={handleCreateBanner}
        />
      </div>
    </div>
  );
}
