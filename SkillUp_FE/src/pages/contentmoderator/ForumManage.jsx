// src/pages/contentmod/ForumManage.jsx
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
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Modal,
  Spin,
  Image,
  Space,
  Tag,
  Typography,
  Divider,
  Popconfirm,
} from "antd";
import Table from "@/components/common/Table";
import { modPostAPI } from "@/api/modPostAPI";
import { categoryApi } from "@/api/forumCategory";
import ForumCategoryModal from "@/components/Forum/ForumCategoryModal";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios";
import { API_BASE_URL } from "@/config/api";
import { PlusCircle } from "lucide-react";

const { Title, Text, Paragraph } = Typography;

export default function ForumManage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch forum posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await modPostAPI.getAllPosts();
      if (response.data.code === 200) {
        setPosts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  };

  // Fetch forum categories
  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      if (response.data.code === 200) {
        const data = response.data.data;
        const categoriesList = Array.isArray(data) ? data : data || [];
        setCategories(categoriesList);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Không thể tải danh sách danh mục");
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  // View post detail
  const handleViewDetail = (post) => {
    setSelectedPost(post);
    setDetailVisible(true);
  };

  // Approve post
  const handleApprove = async (postId) => {
    // Optimistic update
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, status: "active" } : post
      )
    );

    try {
      const response = await modPostAPI.unbanPost(postId);
      if (response.data.code === 200) {
        toast.success("Đã kích hoạt bài viết");
      }
    } catch (error) {
      // Revert on error
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, status: "inactive" } : post
        )
      );
      console.error("Error activating post:", error);
      toast.error("Không thể kích hoạt bài viết");
    }
  };

  // Reject post
  const handleReject = async (postId) => {
    // Optimistic update
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, status: "inactive" } : post
      )
    );

    try {
      const response = await modPostAPI.banPost(postId);
      if (response.data.code === 200) {
        toast.success("Đã vô hiệu hóa bài viết");
      }
    } catch (error) {
      // Revert on error
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, status: "active" } : post
        )
      );
      console.error("Error banning post:", error);
      toast.error("Không thể vô hiệu hóa bài viết");
    }
  };

  const handleEditCategory = () => {
    fetchCategories();
  };

  const handleToggleCategory = async (item) => {
    try {
      const updatedStatus = !item.isActive;

      await axiosInstance.put(
        `${API_BASE_URL}/ForumCategory/update/${item.id}`,
        {
          id: item.id,
          name: item.name,
          isActive: updatedStatus,
        }
      );

      if (updatedStatus) {
        toast.success("Đã kích hoạt danh mục.");
      } else {
        toast.success("Đã vô hiệu hóa danh mục.");
      }
    } catch (error) {
      console.error("Error updating category status:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật!");
    } finally {
      fetchCategories();
    }
  };

  // Filter posts
  const filteredData = posts.filter((post) => {
    const matchSearch =
      post.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      post.contents?.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      post.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchCategory =
      categoryFilter === "all" || post.categoryName === categoryFilter;

    return matchSearch && matchStatus && matchCategory;
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

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Define table columns
  const columns = [
    {
      key: "title",
      title: (
        <div className="flex items-center gap-2">
          Tiêu đề
          <button
            onClick={() => handleSort("title")}
            className="hover:text-blue-600 transition-colors"
          >
            <ArrowsUpDownIcon className="h-4 w-4" />
          </button>
        </div>
      ),
      render: (value) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900 line-clamp-2">{value}</div>
        </div>
      ),
    },
    {
      key: "categoryName",
      title: (
        <div className="flex items-center gap-2">
          Danh mục
          <button
            onClick={() => handleSort("categoryName")}
            className="hover:text-blue-600 transition-colors"
          >
            <ArrowsUpDownIcon className="h-4 w-4" />
          </button>
        </div>
      ),
      render: (value) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value || "N/A"}
        </span>
      ),
    },
    {
      key: "accountName",
      title: "Tác giả",
      render: (value) => <span className="text-gray-700">{value}</span>,
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (value) => {
        const isActive = value?.toLowerCase() === "active";
        return (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
              }`}
          >
            {isActive ? "Hoạt động" : "Vô hiệu hóa"}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      title: (
        <div className="flex items-center gap-2">
          Ngày tạo
          <button
            onClick={() => handleSort("createdAt")}
            className="hover:text-blue-600 transition-colors"
          >
            <ArrowsUpDownIcon className="h-4 w-4" />
          </button>
        </div>
      ),
      render: (value) => new Date(value).toLocaleDateString("vi-VN"),
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
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Diễn đàn</h2>

          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setCategoryModalOpen(true)}
          >
            <PlusCircle size={18} />
            Quản lý danh mục
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
                placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <FunnelIcon className="h-4 w-4" />
                    <SelectValue placeholder="Trạng thái" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Vô hiệu hóa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id || category.name}
                      value={category.name || category.id}
                    >
                      {category.name || category.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(searchText ||
              statusFilter !== "all" ||
              categoryFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchText("");
                    setStatusFilter("all");
                    setCategoryFilter("all");
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
              <span className="font-semibold">{sortedData.length}</span> bài
              viết
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

        {/* Table - Using Reusable Component with Custom Actions */}
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
                  paginatedData.map((item) => {
                    const isActive = item.status?.toLowerCase() === "active";
                    return (
                      <tr
                        key={item.id}
                        className="border-b hover:bg-gray-90 cursor-pointer transition"
                        onClick={() => handleViewDetail(item)}
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
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(item)}
                              className="hover:bg-blue-80 cusrsor-pointer"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>

                            {isActive ? (
                              <Popconfirm
                                title="Vô hiệu hóa bài viết này?"
                                description="Bài viết sẽ không hiển thị cho người dùng"
                                onConfirm={() => handleReject(item.id)}
                                okText="Có"
                                cancelText="Không"
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-red-50 text-red-600"
                                >
                                  <XCircleIcon className="h-4 w-4" />
                                </Button>
                              </Popconfirm>
                            ) : (
                              <Popconfirm
                                title="Kích hoạt bài viết này?"
                                onConfirm={() => handleApprove(item.id)}
                                okText="Có"
                                cancelText="Không"
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-green-50 text-green-600"
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                </Button>
                              </Popconfirm>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
        {sortedData.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy bài viết
            </h3>
            <p className="text-gray-500">
              {searchText || statusFilter !== "all" || categoryFilter !== "all"
                ? "Thử điều chỉnh bộ lọc hoặc tìm kiếm của bạn"
                : "Chưa có bài viết nào được tạo"}
            </p>
          </div>
        )}

        {/* Detail Modal - Keep existing modal code */}
        <Modal
          title={
            <Title level={4} style={{ margin: 0 }}>
              Chi tiết bài viết
            </Title>
          }
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailVisible(false)}>
              Đóng
            </Button>,
          ]}
          width={900}
          style={{ top: 20 }}
        >
          {selectedPost && (
            <div style={{ padding: "8px 0" }}>
              <div style={{ marginBottom: "20px" }}>
                <Text type="secondary" strong>
                  Tiêu đề
                </Text>
                <Title level={5} style={{ marginTop: "8px", marginBottom: 0 }}>
                  {selectedPost.title}
                </Title>
              </div>

              <Divider style={{ margin: "16px 0" }} />

              <Space
                size="large"
                wrap
                style={{ marginBottom: "20px", width: "100%" }}
              >
                <div>
                  <Text type="secondary" strong>
                    Danh mục
                  </Text>
                  <div style={{ marginTop: "8px" }}>
                    <Tag
                      color="blue"
                      style={{ fontSize: "14px", padding: "4px 12px" }}
                    >
                      {selectedPost.categoryName}
                    </Tag>
                  </div>
                </div>

                <div>
                  <Text type="secondary" strong>
                    Tác giả
                  </Text>
                  <div style={{ marginTop: "8px" }}>
                    <Text strong>{selectedPost.accountName}</Text>
                  </div>
                </div>

                <div>
                  <Text type="secondary" strong>
                    Trạng thái
                  </Text>
                  <div style={{ marginTop: "8px" }}>
                    <Tag
                      color={
                        selectedPost.status?.toLowerCase() === "active"
                          ? "green"
                          : "red"
                      }
                      style={{ fontSize: "14px", padding: "4px 12px" }}
                    >
                      {selectedPost.status?.toLowerCase() === "active"
                        ? "Hoạt động"
                        : "Vô hiệu hóa"}
                    </Tag>
                  </div>
                </div>
              </Space>

              <Divider style={{ margin: "16px 0" }} />

              {selectedPost.imageUrls && selectedPost.imageUrls.length > 0 && (
                <>
                  <div style={{ marginBottom: "20px" }}>
                    <Text type="secondary" strong>
                      Hình ảnh ({selectedPost.imageUrls.length})
                    </Text>
                    <div style={{ marginTop: "12px" }}>
                      <Image.PreviewGroup>
                        <Space size="middle" wrap>
                          {selectedPost.imageUrls.map((url, index) => (
                            <Image
                              key={index}
                              src={url}
                              alt={`Post ${index + 1}`}
                              width={150}
                              height={150}
                              style={{
                                objectFit: "cover",
                                borderRadius: "8px",
                                border: "1px solid #f0f0f0",
                              }}
                            />
                          ))}
                        </Space>
                      </Image.PreviewGroup>
                    </div>
                  </div>

                  <Divider style={{ margin: "16px 0" }} />
                </>
              )}

              <div style={{ marginBottom: "20px" }}>
                <Text type="secondary" strong>
                  Nội dung
                </Text>
                <Paragraph
                  style={{
                    marginTop: "12px",
                    padding: "16px",
                    backgroundColor: "#fafafa",
                    borderRadius: "8px",
                    border: "1px solid #f0f0f0",
                    maxHeight: "400px",
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    fontSize: "14px",
                    lineHeight: "1.8",
                  }}
                >
                  {selectedPost.contents}
                </Paragraph>
              </div>

              <Divider style={{ margin: "16px 0" }} />

              <Space size="large" wrap>
                <div>
                  <Text type="secondary" strong>
                    Ngày tạo
                  </Text>
                  <div style={{ marginTop: "8px" }}>
                    <Text>
                      {new Date(selectedPost.createdAt).toLocaleString("vi-VN")}
                    </Text>
                  </div>
                </div>

                {selectedPost.updatedAt && (
                  <div>
                    <Text type="secondary" strong>
                      Ngày cập nhật
                    </Text>
                    <div style={{ marginTop: "8px" }}>
                      <Text>
                        {new Date(selectedPost.updatedAt).toLocaleString(
                          "vi-VN"
                        )}
                      </Text>
                    </div>
                  </div>
                )}
              </Space>
            </div>
          )}
        </Modal>

        <ForumCategoryModal
          open={categoryModalOpen}
          onClose={() => setCategoryModalOpen(false)}
          data={categories}
          onEdit={handleEditCategory}
          onToggle={handleToggleCategory}
        />
      </div>
    </div>
  );
}
