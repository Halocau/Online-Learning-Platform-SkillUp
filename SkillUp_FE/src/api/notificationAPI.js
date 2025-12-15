// src/api/notificationAPI.js
import axiosInstance from "@/lib/axios.js";

const API_BASE_URL = "/Notify";

export const notificationAPI = {
  // Lấy danh sách thông báo của user hiện tại (từ JWT)
  getMyNotifications: async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/GetMyNotifications`);
      // API trả về trực tiếp array hoặc có thể wrap trong data
      return response.data || [];
    } catch (error) {
      console.error("Error getting notifications:", error);
      throw error;
    }
  },

  // Lấy thông báo theo accountId (nếu cần)
  getNotificationsByAccountId: async (accountId) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/GetByAccount/${accountId}`);
      return response.data || [];
    } catch (error) {
      console.error("Error getting notifications by account:", error);
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/read/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/read-all`);
      return response.data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },
};
