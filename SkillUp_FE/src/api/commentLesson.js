// src/api/commentLessonApi.js
import { toast } from "react-toastify";
import axiosInstance from "../lib/axios";
import { API_BASE_URL } from "../config/api";

const API = `${API_BASE_URL}/CommentLesson`;
const LIKE_API = `${API_BASE_URL}/LikeCommentLesson`;
const REPORT_API = `${API_BASE_URL}/CommentReportLesson`;

export const commentLessonApi = {
  getByLesson: async (lessonId) => {
    try {
      const res = await axiosInstance.get(`${API}/GetByLesson/${lessonId}`);
      return res.data?.data ?? [];
    } catch (err) {
      console.error(err);
      console.error("Không thể tải bình luận!");
      return [];
    }
  },

  create: async (payload) => {
    try {
      const res = await axiosInstance.post(`${API}/Create`, payload);
      toast.success("Đã đăng bình luận!");
      return res.data?.data;
    } catch (err) {
      console.error("Không thể đăng bình luận!");
      throw err;
    }
  },

  update: async (payload) => {
    try {
      const res = await axiosInstance.put(`${API}/Update`, payload);
      toast.success("Đã cập nhật bình luận!");
      return res.data?.data;
    } catch (err) {
      console.error("Không thể cập nhật!");
      throw err;
    }
  },

  delete: async (commentId) => {
    try {
      await axiosInstance.delete(`${API}/Delete/${commentId}`);
    } catch (err) {
      console.error("Không thể xóa!");
      throw err;
    }
  },

  toggleLike: async (commentId) => {
    try {
      const res = await axiosInstance.post(`${LIKE_API}/Toggle/${commentId}`);
      return res.data?.data; // returns new like count
    } catch (err) {
      console.error("Không thể thích!");
      throw err;
    }
  },

  report: async (payload) => {
    try {
      await axiosInstance.post(`${REPORT_API}/Create`, payload);
      toast.success("Đã báo cáo bình luận!");
    } catch (err) {
      console.error("Không thể báo cáo!");
      throw err;
    }
  },


  getPendingReports: async () => {
    try {
      const res = await axiosInstance.get(`${REPORT_API}/GetPending`);
      const data = res.data?.data ?? [];
      return Array.isArray(data) && Array.isArray(data[0]) ? data[0] : data;
    } catch (err) {
      console.error("Không thể tải báo cáo!");
      toast.error("Không thể tải báo cáo bài học!");
      return [];
    }
  },

  updateReportStatus: async (reportId, isApproved) => {
    try {
      const res = await axiosInstance.put(`${REPORT_API}/UpdateStatus`, {
        reportId,
        isApproved,
      });
      return res.data?.data;
    } catch (err) {
      console.error("Không thể cập nhật trạng thái!");
      toast.error("Không thể cập nhật trạng thái báo cáo!");
      throw err;
    }
  },
};