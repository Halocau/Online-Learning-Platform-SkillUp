import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios.js";
import { API_BASE_URL } from "@/config/api";
import { handleAPIError, handleAPIResponse } from "@/utils/apiErrorHandler";

const API_URL = `${API_BASE_URL}/Lesson`;

// Giữ lại các hàm cũ để backward compatible, nhưng sử dụng helper mới
const handleAPIErrorLocal = handleAPIError;
const handleAPIResponseLocal = handleAPIResponse;

// Create new lesson
export const createLesson = async (lessonData) => {
  try {
    const formData = new FormData();
    formData.append("SectionId", lessonData.sectionId);
    formData.append("Title", lessonData.title);
    formData.append("Type", lessonData.type);

    if (lessonData.description) {
      formData.append("Description", lessonData.description);
    }

    if (
      lessonData.lessonOrder !== undefined &&
      lessonData.lessonOrder !== null
    ) {
      formData.append("LessonOrder", lessonData.lessonOrder.toString());
    }

    formData.append("IsFree", lessonData.isFree ? "true" : "false");

    if (lessonData.content) {
      formData.append("Content", lessonData.content);
    }

    if (lessonData.videoFile) {
      formData.append("VideoFile", lessonData.videoFile);
    }

    if (lessonData.fileUrl) {
      formData.append("FileUrl", lessonData.fileUrl);
    }

    const res = await axiosInstance.post(API_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });


    return handleAPIResponseLocal(res, "Tạo bài học mới thành công!");
  } catch (err) {
    handleAPIErrorLocal(err, "Không thể tạo bài học!");
    return null;
  }
};

// Update lesson
export const updateLesson = async (id, lessonData) => {
  try {
    const formData = new FormData();
    formData.append("Title", lessonData.title);

    if (lessonData.description) {
      formData.append("Description", lessonData.description);
    }

    if (
      lessonData.lessonOrder !== undefined &&
      lessonData.lessonOrder !== null
    ) {
      formData.append("LessonOrder", lessonData.lessonOrder.toString());
    }

    formData.append("IsFree", lessonData.isFree ? "true" : "false");

    if (lessonData.content) {
      formData.append("Content", lessonData.content);
    }

    if (lessonData.videoFile) {
      formData.append("VideoFile", lessonData.videoFile);
    }

    if (lessonData.fileUrl) {
      formData.append("FileUrl", lessonData.fileUrl);
    }

    const res = await axiosInstance.put(`${API_URL}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    handleAPIResponseLocal(res, "Cập nhật bài học thành công!");
    return res.data;
  } catch (err) {
    handleAPIErrorLocal(err, "Không thể cập nhật bài học!");
    return null;
  }
};

// Delete lesson
export const deleteLesson = async (id) => {
  try {
    const res = await axiosInstance.delete(`${API_URL}/${id}`);
    handleAPIResponseLocal(res, "Xóa bài học thành công!");
    return res.data;
  } catch (err) {
    handleAPIErrorLocal(err, "Không thể xóa bài học!");
    throw err;
  }
};

// Get lessons by section ID
export const getLessonsBySection = async (sectionId) => {
  try {
    const res = await axiosInstance.get(`${API_URL}/section/${sectionId}`);
    return handleAPIResponseLocal(res, "Lấy danh sách bài học thành công!");
  } catch (err) {
    handleAPIErrorLocal(err, "Không thể tải danh sách bài học!");
    return null;
  }
};

// Mark lesson as completed
export const markLessonComplete = async (lessonId) => {
  try {
    const res = await axiosInstance.post(`${API_URL}/${lessonId}/complete`);
    if (res.data?.code === 200) {
      return res.data;
    }
    throw new Error(res.data?.message);
  } catch (err) {
    handleAPIErrorLocal(err, "Không thể đánh dấu hoàn thành bài học!");
    throw err;
  }
};

// Track lesson view (ghi nhận thời gian xem)
export const trackLessonView = async (lessonId) => {
  try {
    const res = await axiosInstance.post(`${API_URL}/${lessonId}/track-view`);
    return res.data;
  } catch (err) {
    // Silent fail - không hiển thị lỗi cho user
    console.error("Error tracking lesson view:", err);
    return null;
  }
};