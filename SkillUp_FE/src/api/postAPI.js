// src/api/postAPI.js
import axiosInstance from "@/lib/axios.js";

const API_BASE_URL = "/Post";

export const postApi = {
  getActive: async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/view-active`);
      return response;
    } catch (error) {
      console.error("Error fetching active posts:", error);
      throw error;
    }
  },

  getUser: async (accountId) => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/user/${accountId}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching user posts:", error);
      throw error;
    }
  },

  getById: async (postId) => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/ViewPostById/${postId}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching post by id:", error);
      throw error;
    }
  },

  create: async (formData) => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  update: async (postId, formData) => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}/update/${postId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      console.log("Calling delete API with id:", id);
      const response = await axiosInstance.put(`${API_BASE_URL}/delete/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  },

  report: async (reportData) => {
    try {
      const response = await axiosInstance.post(
        `/ReportPosts`,
        reportData
      );
      return response;
    } catch (error) {
      console.error("Error reporting post:", error);
      throw error;
    }
  },
};