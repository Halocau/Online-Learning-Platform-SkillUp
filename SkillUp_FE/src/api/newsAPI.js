import { message } from "antd";
import axios from "axios";
import axiosInstance from "../lib/axios";

const API_URL = "http://localhost:5120/api/News";

// -----------------------------
// 🔹 Helper functions for message handling
// -----------------------------
const handleAPIResponse = (res, defaultSuccessMsg = "Thành công!") => {
  const apiRes = res.data;
  if (apiRes?.code >= 200 && apiRes?.code < 300) {
    message.success(apiRes?.message || defaultSuccessMsg);
  } else {
    message.error(apiRes?.message || "Đã xảy ra lỗi!");
  }
  return apiRes?.data ?? [];
};

const handleAPIError = (err, defaultErrorMsg = "Không thể kết nối đến máy chủ!") => {
  console.error("API Error:", err);
  const msg =
    err.response?.data?.message || err.message || defaultErrorMsg;
  message.error(msg);
  return [];
};

// -----------------------------
// 🔹 NEWS API CALLS
// -----------------------------

// 🟩 GET ALL NEWS
export const getAllNews = async () => {
  try {
    const res = await axiosInstance.get(`${API_URL}/all-news`);
    return handleAPIResponse(res, "Lấy danh sách tin tức thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể tải danh sách tin tức!");
  }
};

// 🟩 UPDATE NEWS
export const updateNews = async (news) => {
  try {
    const res = await axiosInstance.put(`${API_URL}/update-news`, news, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    handleAPIResponse(res, "Cập nhật tin tức thành công!");
    return res.data;
  } catch (err) {
    return handleAPIError(err, "Không thể cập nhật tin tức!");
  }
};

// 🟩 DELETE NEWS
export const deleteNews = async (id) => {
  try {
    const res = await axiosInstance.delete(`${API_URL}/delete-news/${id}`);
    handleAPIResponse(res, "Xóa tin tức thành công!");
    return res.data;
  } catch (err) {
    return handleAPIError(err, "Không thể xóa tin tức!");
  }
};
