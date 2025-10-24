// src/pages/news/NewsManage.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Calendar } from "lucide-react";
import { DatePicker, message, Modal } from "antd";
import Table from "@/components/common/Table";
import { getAllNews, deleteNews } from "../../../api/newsAPI";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function NewsManage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [emailSearch, setEmailSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const fetchNews = async () => {
    try {
      setLoading(true);
      const newsList = await getAllNews();
      setData(newsList);
      setFilteredData(newsList);
    } catch (err) {
      console.error(err);
      message.error("Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Filter
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

  // Delete with confirm + message
  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmVisible(true);
  };
  const handleConfirmDelete = async () => {
    try {
      await deleteNews(deleteId);
      message.success("News deleted successfully");
      fetchNews();
    } catch (err) {
      message.error("Failed to delete news");
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
      render: (value) => (
        <div
          className="max-w-[200px] truncate text-gray-600"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">News Management</h2>
        <Button>
          <Link to="/contentmod/createnews">
            <PlusCircle size={25} /> Add News
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
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
    </div>
  );
}
