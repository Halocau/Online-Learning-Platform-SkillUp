// src/api/lecturerDashboardAPI.js

import axiosInstance from "@/lib/axios";


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
};
