import { message } from "antd";
import axiosInstance from "../lib/axios";

const API_URL = "http://localhost:5120/api/Lesson";

const handleAPIResponse = (res, defaultSuccessMsg = "Thành công!") => {
  const apiRes = res.data;
  if (apiRes?.code >= 200 && apiRes?.code < 300) {
    message.success(apiRes?.message || defaultSuccessMsg);
  } else {
    message.error(apiRes?.message || "Đã xảy ra lỗi!");
  }
  return apiRes?.data ?? [];
};

const handleAPIError = (
  err,
  defaultErrorMsg = "Không thể kết nối đến máy chủ!"
) => {
  console.error("API Error:", err);
  console.error("Response data:", err.response?.data);
  console.error("Response status:", err.response?.status);
  const msg = err.response?.data?.message || err.message || defaultErrorMsg;
  message.error(msg);
  return null;
};

// Get all lessons
export const getAllLessons = async () => {
  try {
    const res = await axiosInstance.get(API_URL);
    return handleAPIResponse(res, "Lấy danh sách bài học thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể tải danh sách bài học!");
  }
};

// Create new lesson
export const createLesson = async (lessonData) => {
  try {
    const formData = new FormData();

    // Required fields
    formData.append("SectionId", lessonData.sectionId);
    formData.append("Title", lessonData.title);
    formData.append("Type", lessonData.type);

    // Optional fields - only add if they have values
    if (lessonData.description) {
      formData.append("Description", lessonData.description);
    }

    if (
      lessonData.lessonOrder !== undefined &&
      lessonData.lessonOrder !== null
    ) {
      formData.append("LessonOrder", lessonData.lessonOrder.toString());
    }

    // Boolean field - always send
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

    // Debug log
    console.log("Creating lesson with data:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const res = await axiosInstance.post(API_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return handleAPIResponse(res, "Tạo bài học mới thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể tạo bài học!");
  }
};

// Get active lessons
export const getActiveLessons = async () => {
  try {
    const res = await axiosInstance.get(`${API_URL}/active`);
    return handleAPIResponse(
      res,
      "Lấy danh sách bài học đang hoạt động thành công!"
    );
  } catch (err) {
    return handleAPIError(err, "Không thể tải danh sách bài học!");
  }
};

// Get lesson by ID
export const getLessonById = async (id) => {
  try {
    const res = await axiosInstance.get(`${API_URL}/${id}`);
    return handleAPIResponse(res, "Lấy thông tin bài học thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể tải thông tin bài học!");
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

    // Debug log
    console.log("Updating lesson with data:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
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
    return handleAPIError(err, "Không thể xóa bài học!");
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
