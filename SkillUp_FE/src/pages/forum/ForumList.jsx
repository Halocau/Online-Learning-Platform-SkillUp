import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Button, Spin, Empty } from "antd";
import { Link, useOutletContext } from "react-router-dom";
import { postApi } from "@/api/postAPI";
import PostCard from "@/components/forum/PostCard";
import { PlusCircle, RefreshCcw } from "lucide-react";
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
        return title.includes(searchTerm.toLowerCase());
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
    <div className="max-w-5xl mx-auto py-6 px-2">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="text-base text-gray-700 font-medium">
          {filteredPosts.length} bài viết
          {totalPages > 1 && (
            <span className="ml-2 text-sm text-gray-500">
              (Trang {currentPage} / {totalPages})
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchPosts}
            icon={<RefreshCcw size={16} />}
            className="border-gray-300 rounded-lg text-base"
          >
            Làm mới
          </Button>

          <Link to="/forum/create" className="hidden md:inline-block">
            <Button
              type="primary"
              icon={<PlusCircle size={16} />}
              className="rounded-full bg-[#FFD54F] border-0 text-gray-800 font-semibold px-4 py-2 shadow-sm text-base"
            >
              Tạo bài viết
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Spin size="large" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <Empty description="Không có bài viết nào" />
      ) : (
        <>
          <div className="space-y-5">
            {paginatedPosts.map((p, i) => (
              <motion.div
                key={p.id ?? p.Id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <PostCard post={p} />
              </motion.div>
            ))}
          </div>

          {/* ✨ Improved Pagination ✨ */}
          {totalPages > 1 && (
            <nav className="flex justify-center items-center gap-2 mt-10">
              {/* Previous */}
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border text-lg ${
                  currentPage === 1
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                ❮
              </button>

              {/* Number Buttons */}
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium text-lg transition-all ${
                    currentPage === index + 1
                      ? "bg-yellow-400 text-gray-900 shadow-md scale-105"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              {/* Next */}
              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border text-lg ${
                  currentPage === totalPages
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                ❯
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
