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

  // Cart payment (PayOS)
  createCartPayment: async (items, totalAmount, discountAmount = 0) => {
    try {
      console.log("Creating cart payment with:", { items, totalAmount, discountAmount });

      const response = await axiosInstance.post(
        `${API_BASE_URL}/create-cart-payment`,
        {
          items: items.map(item => ({
            courseId: item.courseId,
            price: item.price,
            finalPrice: item.finalPrice,
            voucherCode: item.voucherCode || null,
            voucherId: item.voucherId || null,
            cartItemId: item.cartItemId || null
          })),
          totalAmount,
          discountAmount
        }
      );

      console.log("Cart payment API response:", response.data);

      if (response.data.code === 200) {
        if (response.data.data && response.data.data.length > 0) {
          return response.data.data[0]; // Trả về CartPaymentResponseDto
        } else {
          // Response thành công nhưng không có data - có thể là free cart
          return {
            Success: true,
            Message: response.data.message || "Thanh toán thành công",
            IsFreeCart: true
          };
        }
      } else {
        throw new Error(response.data.message || "Không thể tạo thanh toán");
      }
    } catch (error) {
      console.error("Error creating cart payment:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  },

  verifyCartPayment: async (orderCode) => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/verify-cart-payment/${orderCode}`
      );

      return response.data.code === 200;
    } catch (error) {
      console.error("Error verifying cart payment:", error);
      throw error;
    }
  },

  // Get purchase history
  getPurchaseHistory: async () => {
    try {
      const response = await axiosInstance.get(
        `/Transaction/history`
      );

      if (response.data.code === 200 && response.data.data && response.data.data.length > 0) {
        return response.data.data[0];
      }
      return [];
    } catch (error) {
      console.error("Error getting purchase history:", error);
      throw error;
    }
  },
};
