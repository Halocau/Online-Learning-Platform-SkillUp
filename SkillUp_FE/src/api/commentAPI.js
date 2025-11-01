import axios from "axios";

const API_BASE_URL = "http://localhost:5120/api";

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

      // Log the exact response structure
      console.log("🔍 API RESPONSE STRUCTURE:", {
        code: response.data.code,
        message: response.data.message,
        firstComment: response.data.data?.[0],
        firstCommentKeys: Object.keys(response.data.data?.[0] || {}),
      });

      return response;
    } catch (error) {
      console.error("❌ Error fetching comments:", error);
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
      console.log("✅ Comment created:", response.data);
      return response;
    } catch (error) {
      console.error("❌ Error creating comment:", error);
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
      console.log("✅ Comment updated:", response.data);
      return response;
    } catch (error) {
      console.error("❌ Error updating comment:", error);
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
      console.log("✅ Comment deleted:", response.data);
      return response;
    } catch (error) {
      console.error("❌ Error deleting comment:", error);
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
      console.log("✅ Comment reported:", response.data);
      return response;
    } catch (error) {
      console.error("❌ Error reporting comment:", error);
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
      console.log("✅ Like toggled:", response.data);
      return response;
    } catch (error) {
      console.error("❌ Error toggling like:", error);
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
      console.log("✅ Like count fetched:", response.data);
      return response;
    } catch (error) {
      console.error("❌ Error fetching like count:", error);
      throw error;
    }
  },
};

export default commentApi;
