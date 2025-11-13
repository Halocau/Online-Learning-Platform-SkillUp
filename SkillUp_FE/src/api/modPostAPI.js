// API for Content Moderator - Forum Post Management
import { axiosInstance } from '@/config/api';

export const modPostAPI = {
  /**
   * Get all forum posts
   * @returns {Promise} Response with all posts
   */
  getAllPosts: () => {
    return axiosInstance.get('/Post/view-all');
  },

  /**
   * Ban a post (set status to Inactive)
   * @param {string} postId - Post ID to ban
   * @returns {Promise} Response
   */
  banPost: (postId) => {
    return axiosInstance.put(`/Post/ban/${postId}`);
  },

  /**
   * Unban a post (set status to Active)
   * @param {string} postId - Post ID to unban
   * @returns {Promise} Response
   */
  unbanPost: (postId) => {
    return axiosInstance.put(`/Post/unban/${postId}`);
  },

  /**
   * Get post by ID
   * @param {string} postId - Post ID
   * @returns {Promise} Response with post details
   */
  getPostById: (postId) => {
    return axiosInstance.get(`/Post/${postId}`);
  },
};

export default modPostAPI;
