// src/api/courseAPI.js
import axiosInstance from "@/lib/axios";

const API_BASE_URL = "/Course";

export const courseAPI = {
  createDraftCourse: async (formData) => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/Add-Course`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
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
      const response = await axiosInstance.get(
        `${API_BASE_URL}/Courses-Of-Lecturer`
      );
      return response;
    } catch (error) {
      console.error("Error fetching lecturer courses:", error);
      throw error;
    }
  },

  updateCourse: async (courseId, formData) => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}/Update-Course/${courseId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  },

  deleteCourse: async (courseId) => {
    try {
      const response = await axiosInstance.delete(
        `${API_BASE_URL}/Delete-Course/${courseId}`
      );
      return response;
    } catch (error) {
      console.error("Error deleting course:", error);
      throw error;
    }
  },

  getAllCourses: async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/All-Courses`);
      return response;
    } catch (error) {
      console.error("Error fetching all courses:", error);
      throw error;
    }
  },

  banUnbanCourse: async (courseId) => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}/ban-unban-course/${courseId}`
      );
      return response;
    } catch (error) {
      console.error("Error banning/unbanning course:", error);
      throw error;
    }
  },

  getCourseDetail: async (courseId) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/${courseId}`);
      return response;
    } catch (error) {
      console.error("Error fetching course detail:", error);
      throw error;
    }
  },

  // Get course detail for learning (requires enrollment)
  getCourseLearningDetail: async (courseId) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/${courseId}/learning`);
      return response;
    } catch (error) {
      console.error("Error fetching learning course detail:", error);
      throw error;
    }
  },

  // Publish course
  publishCourse: async (courseId) => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}/Publish-Course/${courseId}`
      );
      return response;
    } catch (error) {
      console.error("Error publishing course:", error);
      throw error;
    }
  },

  approveCourse: async (courseId, decision, reason = "") => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}/Approve-Course/${courseId}`,
        null,
        {
          params: {
            decision,
            reason: reason || undefined,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error approving course:", error);
      throw error;
    }
  },

  getStudentEnrolledCourses: async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/my-courses`
      );
      return response;
    } catch (error) {
      console.error("Error fetching my courses:", error);
      throw error;
    }
  },

  searchCourses: async (keyword, limit = 8) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/search`, {
        params: { keyword, limit },
      });
      return response;
    } catch (error) {
      console.error("Error searching courses:", error);
      throw error;
    }
  },

  getResumeItem: async (courseId) => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/${courseId}/resume`
      );
      return response;
    } catch (error) {
      console.error("Error fetching resume item:", error);
      throw error;
    }
  },

  reportCourse: async (reportData) => {
    try {
      const response = await axiosInstance.post(
        `/ReportCourse`,
        reportData
      );
      return response;
    } catch (error) {
      console.error("Error reporting course:", error);
      throw error;
    }
  },
};