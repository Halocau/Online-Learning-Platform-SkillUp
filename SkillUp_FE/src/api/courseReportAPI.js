// src/api/courseReportAPI.js
import { message } from "antd";
import axiosInstance from "../lib/axios";

const API_URL = "http://localhost:5120/api/ReportCourse";

const handleAPIResponse = (res, defaultSuccessMsg = "Thành công!") => {
  const apiRes = res.data;
  if (apiRes?.code >= 200 && apiRes?.code < 300) {
    message.success(apiRes?.message || defaultSuccessMsg);
  } else {
    message.error(apiRes?.message || "Đã xảy ra lỗi!");
  }
  return apiRes?.data ?? res.data;
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

export const getAllCourseReports = async () => {
  try {
    const res = await axiosInstance.get(`${API_URL}/view-all`);
    return handleAPIResponse(res, "Lấy danh sách báo cáo khóa học thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể tải danh sách báo cáo khóa học!");
  }
};

export const updateCourseReportStatus = async (reportId, status) => {
  try {
    const res = await axiosInstance.put(`${API_URL}/${reportId}/status`, {
      status,
    });
    return handleAPIResponse(res, "Cập nhật trạng thái báo cáo thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể cập nhật trạng thái báo cáo!");
  }
};

export const getGroupedCourseReports = async () => {
  const response = await axiosInstance.get(`${API_URL}/view-grouped`);
  return response.data;
};