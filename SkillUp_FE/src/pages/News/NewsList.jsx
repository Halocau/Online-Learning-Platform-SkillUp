import React, { useEffect, useState } from "react";
import { getAllNews } from "../../api/newsAPI";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Spin } from "antd";

export default function NewsList() {
  const [newsList, setNewsList] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getAllNews();
        // Sort by date descending (newest first)
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setNewsList(sorted);
        setFilteredNews(sorted);
      } catch (error) {
        console.error("Error loading news:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = newsList.filter(
        (news) =>
          news.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          news.contents?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNews(filtered);
    } else {
      setFilteredNews(newsList);
    }
  }, [searchTerm, newsList]);

  const handleClick = (id) => {
    navigate(`/news/${id}`);
  };

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

  const featuredNews = filteredNews[0];
  const regularNews = filteredNews.slice(1);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tin tức & Bài viết
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm tin tức..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-6 text-base"
            />
          </div>
        </div>

        {filteredNews.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              {searchTerm
                ? "Không tìm thấy tin tức phù hợp"
                : "Chưa có tin tức nào"}
            </p>
          </div>
        ) : (
          <>
            {/* Featured News */}
            {featuredNews && (
              <div
                onClick={() => handleClick(featuredNews.id)}
                className="cursor-pointer mb-12 group"
              >
                <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative h-80 md:h-auto overflow-hidden">
                      <img
                        src={
                          extractImageAndText(featuredNews.contents).image ||
                          "https://via.placeholder.com/800x600"
                        }
                        alt={featuredNews.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold">
                          Mới nhất
                        </span>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {new Date(featuredNews.date).toLocaleDateString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition">
                        {featuredNews.title}
                      </h2>
                      <p className="text-gray-600 text-lg leading-relaxed line-clamp-4">
                        {extractImageAndText(featuredNews.contents).text.trim()}
                      </p>
                      <button className="mt-6 text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center gap-2">
                        Đọc thêm →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Regular News Grid */}
            {regularNews.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Bài viết khác
                </h2>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {regularNews.map((news) => {
                    const { image, text } = extractImageAndText(news.contents);
                    return (
                      <article
                        key={news.id}
                        onClick={() => handleClick(news.id)}
                        className="cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col group"
                      >
                        <div className="relative h-52 overflow-hidden">
                          <img
                            src={image || "https://via.placeholder.com/400x300"}
                            alt={news.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span>
                              {new Date(news.date).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                            {news.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
                            {text.trim()}
                          </p>
                          <button className="mt-4 text-blue-600 font-medium text-sm hover:text-blue-700 inline-flex items-center gap-1">
                            Đọc thêm →
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
