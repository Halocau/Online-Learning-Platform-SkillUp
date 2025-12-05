import axiosInstance from "@/lib/axios";

const BASE_URL = "/Rating";

export const ratingAPI = {
  // Get all ratings for a course
  getCourseRatings: async (courseId) => {
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/course/${courseId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching course ratings:", error);
      throw error;
    }
  },

  // Create a new rating
  createRating: async (data) => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/create`, {
        courseId: data.courseId,
        contents: data.contents,
        star: data.star,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating rating:", error);
      throw error;
    }
  },

  // Update an existing rating
  updateRating: async (data) => {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/update`, {
        ratingId: data.ratingId,
        contents: data.contents,
        star: data.star,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating rating:", error);
      throw error;
    }
  },

  // Delete a rating
  deleteRating: async (ratingId) => {
    try {
      const response = await axiosInstance.delete(
        `${BASE_URL}/delete/${ratingId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting rating:", error);
      throw error;
    }
  },
};
