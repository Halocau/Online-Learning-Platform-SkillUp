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
import { PlusCircle } from "lucide-react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Modal } from "antd";
import Table from "@/components/common/Table";
import { getAllNews, deleteNews } from "../../../api/newsAPI";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "sonner";
import NewsDetailModal from "./DetailNewsMod";
import { extractCleanText, extractFirstImage } from "@/utils/htmlUtils";
export default function NewsManage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const itemsPerPage = 10;

  const fetchNews = async () => {
    try {
      setLoading(true);
      const newsList = await getAllNews();
      setData(newsList);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách tin tức");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleView = (news) => {
    setSelectedNews(news);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmVisible(true);
  };

  const handleConfirmDelete = async () => {
    // Optimistic update
    setData((prevData) => prevData.filter((item) => item.id !== deleteId));

    try {
      await deleteNews(deleteId);
      toast.success("Xóa tin tức thành công!");
    } catch (err) {
      toast.error("Xóa tin tức thất bại!");
      // Revert on error
      fetchNews();
    } finally {
      setConfirmVisible(false);
    }
  };

  // Filter and search logic
  const filteredData = data.filter((news) => {
    const matchesSearch =
      news.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" && news.date === dayjs().format("YYYY-MM-DD")) ||
      (dateFilter === "week" &&
        dayjs(news.date).isAfter(dayjs().subtract(7, "days"))) ||
      (dateFilter === "month" &&
        dayjs(news.date).isAfter(dayjs().subtract(30, "days")));

    return matchesSearch && matchesDate;
  });

  // Sorting logic
  const sortedData = [...filteredData].sort((a, b) => {
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

  const columns = [
    {
      key: "title",
      title: (
        <div className="flex items-center gap-2">
          Tiêu đề
          <button
            onClick={() => handleSort("title")}
            className="hover:text-blue-600"
          >
            <ArrowsUpDownIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
    {
      key: "email",
      title: (
        <div className="flex items-center gap-2">
          Email tác giả
          <button
            onClick={() => handleSort("email")}
            className="hover:text-blue-600"
          >
            <ArrowsUpDownIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
    {
      key: "date",
      title: (
        <div className="flex items-center gap-2">
          Ngày đăng
          <button
            onClick={() => handleSort("date")}
            className="hover:text-blue-600"
          >
            <ArrowsUpDownIcon className="h-4 w-4" />
          </button>
        </div>
      ),
      render: (value) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      key: "contents",
      title: "Nội dung",
      render: (value) => {
        if (!value) {
          return (
            <span className="text-gray-400 italic text-sm">
              Không có nội dung
            </span>
          );
        }

        const imgSrc = extractFirstImage(value);
        const cleanText = extractCleanText(value, 180);

        return (
          <div className="flex items-start gap-3 max-w-[500px]">
            {imgSrc && (
              <img
                src={imgSrc}
                alt="thumbnail"
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0 shadow-sm border border-gray-100"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed break-words">
                {cleanText}
              </p>
            </div>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải tin tức...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">Quản lý tin tức</h2>
          <Button>
            <Link
              to="/contentmod/createnews"
              className="flex items-center gap-2"
            >
              Thêm tin tức <PlusCircle size={18} />
            </Link>
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề hoặc email tác giả..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Date Filter */}
            <div className="w-full lg:w-48">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Lọc theo ngày" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="today">Hôm nay</SelectItem>
                  <SelectItem value="week">7 ngày qua</SelectItem>
                  <SelectItem value="month">30 ngày qua</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || dateFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter("all");
                  setCurrentPage(1);
                }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-600">
            Đang hiện {paginatedData.length} / {sortedData.length} tin tức
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={paginatedData}
          onEdit={(item) => navigate(`/contentmod/editnews/${item.id}`)}
          onDelete={(itemId) => handleDelete(itemId)}
          onRowClick={handleView}
        />

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

        {/* Delete Confirmation Modal */}
        <Modal
          title="Xác nhận xóa"
          open={confirmVisible}
          onOk={handleConfirmDelete}
          onCancel={() => setConfirmVisible(false)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          Bạn có chắc chắn muốn xóa tin tức này không?
        </Modal>

        {/* News Detail Modal */}
        <NewsDetailModal
          visible={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          news={selectedNews}
        />
      </div>
    </div>
  );
}
