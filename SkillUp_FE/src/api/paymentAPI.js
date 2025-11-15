// src/api/paymentAPI.js
import axiosInstance from "@/lib/axios";

const API_BASE_URL = "/Payment";

export const paymentAPI = {
  // Course payment (PayOS)
  createCoursePayment: async (courseId) => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/create-course-payment`,
        { courseId }
      );
      
      // Backend trả về format: { code, message, data }
      if (response.data.code === 200 && response.data.data && response.data.data.length > 0) {
        return response.data.data[0]; // Trả về CoursePaymentResponseDto
      } else {
        throw new Error(response.data.message || "Không thể tạo thanh toán");
      }
    } catch (error) {
      console.error("Error creating course payment:", error);
      throw error;
    }
  },

  verifyCoursePayment: async (orderCode) => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/verify-course-payment/${orderCode}`
      );
      
      // Backend trả về format: { code, message, data }
      return response.data.code === 200;
    } catch (error) {
      console.error("Error verifying course payment:", error);
      throw error;
    }
  },

  cancelCoursePayment: async (orderCode) => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/cancel-course-payment/${orderCode}`
      );
      
      // Backend trả về format: { code, message, data }
      return response.data.code === 200;
    } catch (error) {
      console.error("Error cancelling course payment:", error);
      throw error;
    }
  },

  getMyEnrollments: async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/my-enrollments`
      );
      
      // Backend trả về format: { code, message, data }
      if (response.data.code === 200 && response.data.data && response.data.data.length > 0) {
        return response.data.data[0]; // Trả về List<CourseEnrollmentDto>
      }
      return [];
    } catch (error) {
      console.error("Error getting enrollments:", error);
      throw error;
    }
  },
};
