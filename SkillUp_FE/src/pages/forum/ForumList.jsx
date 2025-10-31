import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Button, Spin, Empty } from "antd";
import { Link, useOutletContext } from "react-router-dom";
import { postApi } from "@/api/postAPI";
import PostCard from "@/pages/forum/components/PostCard";
import { Plus, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const PAGE_SIZE = 5;

export default function ForumList() {
  const { searchTerm, filterCat, filterDate } = useOutletContext();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await postApi.getActive();
      setPosts(res?.data?.data ?? []);
    } catch (err) {
      console.error("Fetch posts failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    if (filterCat) {
      filtered = filtered.filter((p) => {
        const catName = (p.categoryName ?? p.CategoryName ?? "").toString();
        return catName.toLowerCase() === filterCat.toLowerCase();
      });
    }

    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter((p) => {
        const title = (p.title ?? p.Title ?? "").toString().toLowerCase();
        const content = (p.contents ?? p.Contents ?? "").toString().toLowerCase();
        return (
          title.includes(searchTerm.toLowerCase()) ||
          content.includes(searchTerm.toLowerCase())
        );
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt ?? a.CreatedAt ?? 0).getTime();
      const dateB = new Date(b.createdAt ?? b.CreatedAt ?? 0).getTime();
      return filterDate === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [posts, filterCat, searchTerm, filterDate]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredPosts.length]);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredPosts.slice(start, end);
  }, [filteredPosts, currentPage]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Diễn đàn SkillUp</h1>
              <p className="text-gray-600">
                {filteredPosts.length > 0
                  ? `${filteredPosts.length} bài viết • Trang ${currentPage}/${totalPages}`
                  : "Không có bài viết nào"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={fetchPosts}
                icon={<RefreshCw size={16} />}
                className="rounded-lg font-medium border-gray-300 hover:border-gray-400"
              >
                Làm mới
              </Button>

              <Link to="/forum/create">
                <Button
                  type="primary"
                  icon={<Plus size={16} />}
                  className="rounded-lg bg-indigo-600 border-0 font-medium hover:bg-indigo-700 hidden sm:inline-flex"
                >
                  Bài viết mới
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Create Button */}
          <Link to="/forum/create" className="sm:hidden">
            <Button
              type="primary"
              icon={<Plus size={16} />}
              className="w-full rounded-lg bg-indigo-600 border-0 font-medium hover:bg-indigo-700 h-10"
            >
              Tạo bài viết mới
            </Button>
          </Link>
        </div>

        {/* Posts Container */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Empty
              description="Không có bài viết nào"
              style={{ color: "#9CA3AF" }}
            />
            <Link to="/forum/create" className="inline-block mt-4">
              <Button type="primary" className="rounded-lg bg-indigo-600 border-0">
                Tạo bài viết đầu tiên
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Posts List */}
            <div className="space-y-4 mb-8">
              {paginatedPosts.map((p, i) => (
                <motion.div
                  key={p.id ?? p.Id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <PostCard post={p} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pb-8">
                {/* Previous Button */}
                <button
                  onClick={() =>
                    handlePageChange(Math.max(1, currentPage - 1))
                  }
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 font-medium transition-all duration-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    const isActive = currentPage === pageNum;
                    const isNearCurrent =
                      Math.abs(pageNum - currentPage) <= 1 ||
                      pageNum === 1 ||
                      pageNum === totalPages;

                    if (!isNearCurrent && totalPages > 5) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-semibold transition-all duration-200 ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-lg scale-105"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 font-medium transition-all duration-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}