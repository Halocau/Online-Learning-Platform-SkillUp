import { message } from "antd";
import axiosInstance from "@/lib/axios.js";
import { API_BASE_URL } from "@/config/api";

const API_URL = `${API_BASE_URL}/Sections`;

const handleAPIResponse = (res, defaultSuccessMsg = "Thành công!") => {
  const apiRes = res.data;
  if (apiRes?.code >= 200 && apiRes?.code < 300) {
    message.success(apiRes?.message || defaultSuccessMsg);
  } else {
    message.error(apiRes?.message || "Đã xảy ra lỗi!");
  }
  return apiRes?.data ?? [];
};

const handleAPIError = (
  err,
  defaultErrorMsg = "Không thể kết nối đến máy chủ!"
) => {
  console.error("API Error:", err);
  const msg = err.response?.data?.message || err.message || defaultErrorMsg;
  message.error(msg);
  return [];
};

// Create new section
export const createSection = async (sectionData) => {
  try {
    const res = await axiosInstance.post(API_URL, sectionData);
    return handleAPIResponse(res, "Tạo chương mới thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể tạo chương!");
  }
};

// Get section by ID
export const getSectionById = async (id) => {
  try {
    const res = await axiosInstance.get(`${API_URL}/${id}`);
    return handleAPIResponse(res, "Lấy thông tin chương thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể tải thông tin chương!");
  }
};

// Update section
export const updateSection = async (id, sectionData) => {
  try {
    const res = await axiosInstance.put(`${API_URL}/${id}`, sectionData);
    handleAPIResponse(res, "Cập nhật chương thành công!");
    return res.data;
  } catch (err) {
    return handleAPIError(err, "Không thể cập nhật chương!");
  }
};

// Delete section
export const deleteSection = async (id) => {
  try {
    const res = await axiosInstance.delete(`${API_URL}/${id}`);
    handleAPIResponse(res, "Xóa chương thành công!");
    return res.data;
  } catch (err) {
    return handleAPIError(err, "Không thể xóa chương!");
  }
};

// Get sections by course ID
export const getSectionsByCourse = async (courseId) => {
  try {
    const res = await axiosInstance.get(`${API_URL}/ByCourse/${courseId}`);
    return handleAPIResponse(res, "Lấy danh sách chương thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể tải danh sách chương!");
  }
};

// Manage section (update section manager)
export const manageSection = async (id, managerData) => {
  try {
    const res = await axiosInstance.put(
      `${API_URL}/ManagerSection/${id}`,
      managerData
    );
    handleAPIResponse(res, "Cập nhật quản lý chương thành công!");
    return res.data;
  } catch (err) {
    return handleAPIError(err, "Không thể cập nhật quản lý chương!");
  }
};
