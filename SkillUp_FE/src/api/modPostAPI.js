// src/api/modPostAPI.js
import axiosInstance from "@/lib/axios";

const API_BASE_URL = "/Post";

export const modPostAPI = {
    // Get all posts for Content Moderator
    getAllPosts: async () => {
        try {
            const response = await axiosInstance.get(`${API_BASE_URL}/view-all`);
            return response;
        } catch (error) {
            console.error("Error fetching all posts:", error);
            throw error;
        }
    },

    // Ban a post
    banPost: async (postId) => {
        try {
            const response = await axiosInstance.put(`${API_BASE_URL}/ban/${postId}`);
            return response;
        } catch (error) {
            console.error("Error banning post:", error);
            throw error;
        }
    },

    // Unban a post
    unbanPost: async (postId) => {
        try {
            const response = await axiosInstance.put(`${API_BASE_URL}/unban/${postId}`);
            return response;
        } catch (error) {
            console.error("Error unbanning post:", error);
            throw error;
        }
    },
};
