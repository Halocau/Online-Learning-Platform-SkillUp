// src/api/lecturerDashboardAPI.js

import axiosInstance from "@/lib/axios.js";

export const lecturerDashboardAPI = {
  getViewDashboard: async () => {
    return await axiosInstance.get("/LecturerDashboard/viewdashboard");
  },

  getRevenue: async (year = null, courseId = null) => {
    const params = {};
    if (year) params.year = year;
    if (courseId) params.courseId = courseId;

    return await axiosInstance.get("/LecturerDashboard/revenue", { params });
  },

  getStudents: async () => {
    try {
      const response = await axiosInstance.get("/LecturerDashboard/students");
      return response.data;
    } catch (error) {
      console.error("Error fetching students:", error);
      throw error;
    }
  },
};
