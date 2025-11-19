// src/api/commentLessonApi.js
import { toast } from "react-toastify";
import axiosInstance from "../lib/axios";


const API = "http://localhost:5120/api/CommentLesson";
const LIKE_API = "http://localhost:5120/api/LikeCommentLesson";
const REPORT_API = "http://localhost:5120/api/CommentReportLesson";

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
      toast.success("Đã xóa bình luận!");
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
};
