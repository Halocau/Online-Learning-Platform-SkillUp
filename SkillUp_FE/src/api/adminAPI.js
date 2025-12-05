// src/api/adminAPI.js
import axiosInstance from "@/lib/axios";

const API_BASE_URL = "/Admin";

export const adminAPI = {
  // Get Monthly Payroll Report
  getMonthlyPayrollReport: async (month, year) => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/monthly-payroll-report`,
        {
          params: { month, year },
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching monthly payroll report:", error);
      throw error;
    }
  },
};