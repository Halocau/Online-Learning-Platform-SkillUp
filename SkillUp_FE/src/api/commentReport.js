// src/api/commentReportAPI.js
import { message } from "antd";
import axiosInstance from "../lib/axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/CommentReport`;

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

export const getAllReports = async () => {
  try {
    const res = await axiosInstance.get(`${API_URL}/All`);
    return handleAPIResponse(res, "Lấy danh sách báo cáo thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể tải danh sách báo cáo!");
  }
};

export const getPendingReports = async () => {
  try {
    const res = await axiosInstance.get(`${API_URL}/Pending`);
    return handleAPIResponse(
      res,
      "Lấy danh sách báo cáo chờ xử lý thành công!"
    );
  } catch (err) {
    return handleAPIError(err, "Không thể tải danh sách báo cáo chờ xử lý!");
  }
};

export const resolveReport = async (reportId, shouldDeleteComment) => {
  try {
    const res = await axiosInstance.put(`${API_URL}/Resolve`, {
      reportId,
      shouldDeleteComment,
    });
    return handleAPIResponse(res, "Xử lý báo cáo thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể xử lý báo cáo!");
  }
};
