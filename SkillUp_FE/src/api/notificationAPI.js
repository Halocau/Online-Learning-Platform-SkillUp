// src/api/notificationAPI.js
import axiosInstance from "@/lib/axios";

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
};

