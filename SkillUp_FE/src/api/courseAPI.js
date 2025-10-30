// src/api/courseAPI.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5120/api",
  headers: { "Content-Type": "application/json" },
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const courseAPI = {
  getCoursesOfLecturer: () => API.get("/Course/Courses-Of-Lecturer"),
  createCourse: (formData) =>
    API.post("/Course/Add-Course", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getCourseById: (courseId) => API.get(`/Course/${courseId}`),

  updateCourse: (courseId, formData) => {
    console.warn("Update course not fully implemented - needs requirement review");
    return API.put(`/Course/Update-Course/${courseId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Delete course
   * DELETE /api/Course/{courseId}
   * Placeholder - needs requirement clarification
   */
  deleteCourse: (courseId) => {
    console.warn("Delete course not fully implemented - needs requirement review");
    return API.delete(`/Course/${courseId}`);
  },
};

export default courseAPI;