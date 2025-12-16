// src/api/modDashboardAPI.js
import axiosInstance from "@/lib/axios.js";

const CONTENT_MOD_DASHBOARD_ENDPOINT = "/ModeratorContent/dashboard";
const SYSTEM_MOD_DASHBOARD_ENDPOINT = "/SystemModeratorDashboard/system-mod-dashboard";

export const modDashboardAPI = {
  // Get Content Moderator Dashboard Data
  getContentModDashboard: async () => {
    try {
      const response = await axiosInstance.get(CONTENT_MOD_DASHBOARD_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error("Error fetching content mod dashboard:", error);
      throw error;
    }
  },

  // Get System Moderator Dashboard Data
  getSystemModDashboard: async () => {
    try {
      const response = await axiosInstance.get(SYSTEM_MOD_DASHBOARD_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error("Error fetching system mod dashboard:", error);
      throw error;
    }
  },
};