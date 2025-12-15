import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "@/lib/axios.js";
import { API_BASE_URL } from "@/config/api";
import { getAllNews } from "@/api/newsAPI";

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [recommendedNews, setRecommendedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current news detail
        const res = await axiosInstance.get(
          `${API_BASE_URL}/News/${id}`
        );
        const data = res.data.data?.[0];
        setNews(data);

        const allNews = await getAllNews();

        const filtered = allNews.filter((item) => item.id !== id);
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        setRecommendedNews(shuffled.slice(0, 3));
      } catch (err) {
        console.error("Error loading news detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const extractImageAndText = (htmlContent) => {
    if (!htmlContent) return { image: null, text: "" };
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const imgTag = doc.querySelector("img");
    const image = imgTag ? imgTag.src : null;
    if (imgTag) imgTag.remove();
    const text = doc.body.textContent || "";
    return { image, text };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-500 text-lg mb-4">Không tìm thấy tin tức!</p>
        <Link
          to="/news"
          className="text-blue-500 hover:underline inline-flex items-center gap-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Quay lại danh sách tin tức
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/news"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Quay lại danh sách tin tức
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-2xl shadow-sm p-8">
              {/* Article Header */}
              <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {news.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 pb-6 mb-6 border-b border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <UserIcon className="h-5 w-5" />
                  <span className="text-sm">{news.email || "Admin"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarIcon className="h-5 w-5" />
                  <span className="text-sm">
                    {new Date(news.date).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <button className="ml-auto flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                  <ShareIcon className="h-5 w-5" />
                  Chia sẻ
                </button>
              </div>

              {/* Article Content */}
              <div
                className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-img:rounded-xl prose-img:shadow-md"
                dangerouslySetInnerHTML={{
                  __html: news.contents.replace(
                    /<img([^>]+?)src="([^">]+)"([^>]*?)>/g,
                    '<img src="$2" style="width:100%;height:auto;object-fit:cover;border-radius:12px;margin:24px 0;display:block;"/>'
                  ),
                }}
              />
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Recommended News */}
              {recommendedNews.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Tin tức liên quan
                  </h3>
                  <div className="space-y-4">
                    {recommendedNews.map((item) => {
                      const { image, text } = extractImageAndText(
                        item.contents
                      );
                      return (
                        <div
                          key={item.id}
                          onClick={() => navigate(`/news/${item.id}`)}
                          className="group cursor-pointer"
                        >
                          <div className="flex gap-3">
                            <img
                              src={
                                image || "https://via.placeholder.com/120x80"
                              }
                              alt={item.title}
                              className="w-24 h-20 object-cover rounded-lg flex-shrink-0 group-hover:opacity-80 transition"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition line-clamp-2 mb-1">
                                {item.title}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {new Date(item.date).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Khám phá thêm
                </h3>
                <div className="space-y-3">
                  <Link
                    to="/courses"
                    className="block text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    → Khóa học mới nhất
                  </Link>
                  <Link
                    to="/news"
                    className="block text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    → Tất cả tin tức
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
