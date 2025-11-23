import { toast } from "react-toastify";
import axiosInstance from "../lib/axios";

const API_URL = "http://localhost:5120/api/Lesson";

const handleAPIResponse = (res, defaultSuccessMsg = "Thành công!") => {
  const apiRes = res.data;
  if (apiRes?.code >= 200 && apiRes?.code < 300) {
    toast.success(apiRes?.message || defaultSuccessMsg);
  } else {
    toast.error(apiRes?.message || "Đã xảy ra lỗi!");
  }
  return apiRes?.data ?? [];
};

const handleAPIError = (
  err,
  defaultErrorMsg = "Không thể kết nối đến máy chủ!"
) => {
  console.error("API Error:", err);
  console.error("Response data:", err.response?.data);
  const msg = err.response?.data?.message || err.message || defaultErrorMsg;
  toast.error(msg);
  return null;
};

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

    
    return handleAPIResponse(res, "Tạo bài học mới thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể tạo bài học!");
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

    handleAPIResponse(res, "Cập nhật bài học thành công!");
    return res.data;
  } catch (err) {
    return handleAPIError(err, "Không thể cập nhật bài học!");
  }
};

// Delete lesson
export const deleteLesson = async (id) => {
  try {
    const res = await axiosInstance.delete(`${API_URL}/${id}`);
    handleAPIResponse(res, "Xóa bài học thành công!");
    return res.data;
  } catch (err) {
    handleAPIError(err, "Không thể xóa bài học!");
    throw err;
  }
};

// Get lessons by section ID
export const getLessonsBySection = async (sectionId) => {
  try {
    const res = await axiosInstance.get(`${API_URL}/section/${sectionId}`);
    return handleAPIResponse(res, "Lấy danh sách bài học thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể tải danh sách bài học!");
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
    handleAPIError(err, "Không thể đánh dấu hoàn thành bài học!");
    throw err;
  }
};