// src/pages/student/NewsDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Spin } from "antd";
import axiosInstance from "../../lib/axios";

export default function NewsDetail() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const res = await axiosInstance.get(`http://localhost:5120/api/News/${id}`);
        const data = res.data.data?.[0];
        setNews(data);
      } catch (err) {
        console.error("Error loading news detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewsDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!news) {
    return <p className="text-center mt-10 text-red-500">Không tìm thấy tin tức!</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <Link to="/news" className="text-blue-500 hover:underline mb-4 inline-block">
        ← Quay lại danh sách tin tức
      </Link>
      <h1 className="text-3xl font-bold mb-4">{news.title}</h1>
      <p className="text-gray-500 text-sm mb-4">{news.date}</p>
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: news.contents }}
      />
    </div>
  );
}
