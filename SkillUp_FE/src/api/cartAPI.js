// src/api/cartAPI.js
import axiosInstance from "@/lib/axios";

const API_BASE_URL = "/Cart";

export const cartAPI = {
    // Lấy giỏ hàng của user
    getCart: async (accountId) => {
        try {
            const response = await axiosInstance.get(`${API_BASE_URL}/${accountId}`);
            return response;
        } catch (error) {
            console.error("Error getting cart:", error);
            throw error;
        }
    },

    // Thêm khóa học vào giỏ hàng
    addToCart: async (accountId, courseId, price) => {
        try {
            const response = await axiosInstance.post(
                `${API_BASE_URL}/AddToCart/${accountId}`,
                {
                    CourseId: courseId,
                    Price: price,
                }
            );
            return response;
        } catch (error) {
            console.error("Error adding to cart:", error);
            throw error;
        }
    },

    // Xóa item khỏi giỏ hàng
    removeFromCart: async (cartItemId) => {
        try {
            const response = await axiosInstance.delete(
                `${API_BASE_URL}/RemoveFromCart/${cartItemId}`
            );
            return response;
        } catch (error) {
            console.error("Error removing from cart:", error);
            throw error;
        }
    },

    // Thêm nhiều items vào giỏ hàng (bulk add)
    bulkAddToCart: async (accountId, items) => {
        try {
            const payload = {
                Items: items.map((item) => ({
                    CourseId: item.courseId,
                    Price: item.price,
                })),
            };
            const response = await axiosInstance.post(
                `${API_BASE_URL}/bulk-add/${accountId}`,
                payload
            );
            return response;
        } catch (error) {
            console.error("Error bulk adding to cart:", error);
            throw error;
        }
    },
};
