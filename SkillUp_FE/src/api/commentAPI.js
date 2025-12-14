import axios from "axios";
import { API_BASE_URL } from "../config/api";

const getAuthToken = () => {
  return localStorage.getItem("accessToken") || localStorage.getItem("token");
};

export const commentApi = {
  // Get all comments for a post
  getByPost: async (postId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/CommentPost/GetByPost/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new comment or reply
  create: async (data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/CommentPost/Create`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      return response;
    } catch (error) {
      throw error;
    }
  },

  update: async (data) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/CommentPost/Update`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      return response;
    } catch (error) {
      throw error;
    }
  },

  delete: async (commentId) => {
    try {
      console.log("🗑️ Deleting comment:", commentId);
      const response = await axios.delete(
        `${API_BASE_URL}/CommentPost/Delete/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      return response;
    } catch (error) {
      throw error;
    }
  },

  report: async (data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/CommentReport/Create`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  toggleLike: async (commentPostId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/LikeCommentPost/toggle/${commentPostId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      return response;
    } catch (error) {
      throw error;
    }
  },

  getLikeCount: async (commentPostId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/LikeCommentPost/count/${commentPostId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default commentApi;
