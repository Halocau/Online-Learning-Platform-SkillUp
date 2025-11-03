import axios from "axios";

const API_BASE_URL = "http://localhost:5120/api/Course";

// Helper function to get token - FIX: Use consistent token retrieval
const getAuthToken = () => {
  return localStorage.getItem("accessToken") || localStorage.getItem("token");
};

export const courseAPI = {
  
  createDraftCourse: async (formData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Add-Course`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error creating draft course:", error);
      throw error;
    }
  },

  getCoursesOfLecturer: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Courses-Of-Lecturer`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching lecturer courses:", error);
      throw error;
    }
  },

  updateCourse: async (courseId, formData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/Update-Course/${courseId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  },

  // FIX: Ensure proper error handling and return
  deleteCourse: async (courseId) => {
    try {
      console.log("🗑️ Deleting course with ID:", courseId);
      const response = await axios.delete(
        `${API_BASE_URL}/Delete-Course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      console.log("✅ Delete response received:", response.data);
      return response;
    } catch (error) {
      console.error("❌ Error deleting course:", error);
      throw error;
    }
  },
};