// src/pages/news/NewsManage.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Calendar } from "lucide-react";
import { DatePicker, Modal } from "antd";
import Table from "@/components/common/Table";
import { getAllNews, deleteNews } from "../../../api/newsAPI";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewsDetailModal from "./DetailNewsMod";


export default function NewsManage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [emailSearch, setEmailSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
const [selectedNews, setSelectedNews] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);

const handleView = (news) => {
  setSelectedNews(news);
  setIsModalOpen(true);
};

const fetchNews = async () => {
    try {
      setLoading(true);
      const newsList = await getAllNews();
      setData(newsList);
      setFilteredData(newsList);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const applyFilters = (emailValue, dateValue) => {
    let result = data;

    if (emailValue) {
      const v = emailValue.toLowerCase();
      result = result.filter((n) => n.email.toLowerCase().includes(v));
    }

    if (dateValue) {
      const dateString = dayjs(dateValue).format("YYYY-MM-DD");
      result = result.filter((n) => n.date === dateString);
    }

    setFilteredData(result);
  };

  const handleEmailSearch = (value) => {
    setEmailSearch(value);
    applyFilters(value, selectedDate);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    applyFilters(emailSearch, date);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmVisible(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteNews(deleteId);
      toast.success("News deleted successfully");
      fetchNews();
    } catch (err) {
      toast.error("Failed to delete news");
    } finally {
      setConfirmVisible(false);
    }
  };

  const columns = [
    { key: "title", title: "Title" },
    { key: "email", title: "Author Email" },
    { key: "date", title: "Date" },
    {
      key: "contents",
      title: "Content",
      render: (value) => {
        if (!value) return null;

        // Extract first image and remove it from text
        const imgMatch = value.match(/<img[^>]+src="([^">]+)"/);
        const imgSrc = imgMatch ? imgMatch[1] : null;
        const cleanText = value
          .replace(/<img[^>]*>/g, "")
          .replace(/<\/?[^>]+(>|$)/g, " ") // remove html tags
          .replace(/\s+/g, " ")
          .trim();

        return (
          <div
            className="flex items-start gap-3 max-w-[420px] overflow-hidden"
            style={{ alignItems: "flex-start" }}
          >
            {imgSrc && (
              <img
                src={imgSrc}
                alt="thumb"
                className="w-[100px] h-[70px] object-cover rounded-lg flex-shrink-0"
              />
            )}
            <p
              className="text-gray-700 leading-snug overflow-hidden"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                maxHeight: "5.6em",
                textOverflow: "ellipsis",
              }}
            >
              {cleanText}
            </p>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">News Management</h2>
        <Button>
          <Link to="/contentmod/createnews" className="flex items-center gap-2">
            Add News <PlusCircle size={18} />
          </Link>
        </Button>
      </div>

      
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Search className="text-gray-400" />
          <Input
            placeholder="Search by author email..."
            value={emailSearch}
            onChange={(e) => handleEmailSearch(e.target.value)}
            className="w-60"
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-400" />
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            placeholder="Filter by date"
            allowClear
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredData}
        onEdit={(item) => navigate(`/contentmod/editnews/${item.id}`)}
        onDelete={(itemId) => handleDelete(itemId)}
        onRowClick={handleView}
        loading={loading}
      />

      <Modal
        title="Confirm Delete"
        open={confirmVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setConfirmVisible(false)}
        okText="Yes, delete it"
        cancelText="Cancel"
      >
        Are you sure you want to delete this news?
      </Modal>

      <NewsDetailModal
  visible={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  news={selectedNews}
/>

    </div>
  );
}
