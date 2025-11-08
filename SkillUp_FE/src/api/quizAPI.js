import { toast } from "react-toastify";
import axiosInstance from "../lib/axios";

const API_URL = "http://localhost:5120/api/Quiz";

const handleAPIResponse = (res, defaultSuccessMsg = "Thành công!") => {
  const apiRes = res.data;
  if (apiRes?.code >= 200 && apiRes?.code < 300) {
    toast.success(apiRes?.message || defaultSuccessMsg);
    return apiRes?.data ?? [];
  } else {
    toast.error(apiRes?.message || "Đã xảy ra lỗi!");
    return null;
  }
};

const handleAPIError = (
  err,
  defaultErrorMsg = "Không thể kết nối đến máy chủ!"
) => {
  console.error("=== Quiz API Error ===");
  console.error("Error:", err);
  console.error("Response status:", err.response?.status);
  console.error("Response data:", err.response?.data);
  console.error("Request URL:", err.config?.url);
  console.error("Request method:", err.config?.method);
  console.error("Request data:", err.config?.data);
  console.error("=====================");

  const msg = err.response?.data?.message || err.message || defaultErrorMsg;
  toast.error(msg);
  throw err;
};

// Get quiz by ID
export const getQuizById = async (quizId) => {
  try {
    const res = await axiosInstance.get(`${API_URL}/View-Quiz/${quizId}`);
    return handleAPIResponse(res, "Lấy thông tin quiz thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể tải quiz!");
  }
};

// Create new quiz - NOW WITH ORDERS FIELD
export const createQuiz = async (quizData) => {
  try {
    // Validate
    if (!quizData.sectionId) {
      throw new Error("SectionId is required");
    }
    if (!quizData.title || quizData.title.trim() === "") {
      throw new Error("Title is required");
    }

    // Build payload - INCLUDE ORDERS if provided
    const payload = {
      sectionId: String(quizData.sectionId),
      title: String(quizData.title).trim(),
      description: quizData.description
        ? String(quizData.description).trim()
        : "",
      passPercent: Number(quizData.passPercent),
      timer: Number(quizData.timer),
    };

    // ADD ORDERS FIELD if provided
    if (quizData.orders !== undefined && quizData.orders !== null) {
      payload.orders = Number(quizData.orders);
      console.log("⚠️ Adding 'orders' field to payload:", payload.orders);
    }

    // Validate number fields
    if (
      isNaN(payload.passPercent) ||
      payload.passPercent < 0 ||
      payload.passPercent > 100
    ) {
      throw new Error("PassPercent must be between 0 and 100");
    }
    if (isNaN(payload.timer) || payload.timer <= 0) {
      throw new Error("Timer must be greater than 0");
    }

    console.log("=== Creating Quiz ===");
    console.log("Payload:", JSON.stringify(payload, null, 2));
    console.log("====================");

    const res = await axiosInstance.post(`${API_URL}/Add-Quiz`, payload);

    console.log("=== Quiz Created Successfully ===");
    console.log("Response:", res.data);
    console.log("=================================");

    return handleAPIResponse(res, "Tạo quiz thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể tạo quiz!");
  }
};

// Update quiz
export const updateQuiz = async (quizId, quizData) => {
  try {
    if (!quizData.title || quizData.title.trim() === "") {
      throw new Error("Title is required");
    }

    const payload = {
      title: String(quizData.title).trim(),
      description: quizData.description
        ? String(quizData.description).trim()
        : "",
      passPercent: Number(quizData.passPercent),
      timer: Number(quizData.timer),
    };

    // Validate number fields
    if (
      isNaN(payload.passPercent) ||
      payload.passPercent < 0 ||
      payload.passPercent > 100
    ) {
      throw new Error("PassPercent must be between 0 and 100");
    }
    if (isNaN(payload.timer) || payload.timer <= 0) {
      throw new Error("Timer must be greater than 0");
    }

    console.log("=== Updating Quiz ===");
    console.log("Quiz ID:", quizId);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    console.log("====================");

    const res = await axiosInstance.put(
      `${API_URL}/Update-Quiz/${quizId}`,
      payload
    );

    console.log("=== Quiz Updated Successfully ===");
    console.log("Response:", res.data);
    console.log("=================================");

    handleAPIResponse(res, "Cập nhật quiz thành công!");
    return res.data;
  } catch (err) {
    return handleAPIError(err, "Không thể cập nhật quiz!");
  }
};

// Delete quiz
export const deleteQuiz = async (quizId) => {
  try {
    console.log("=== Deleting Quiz ===");
    console.log("Quiz ID:", quizId);
    console.log("====================");

    const res = await axiosInstance.delete(`${API_URL}/Delete-Quiz/${quizId}`);

    console.log("=== Quiz Deleted Successfully ===");
    console.log("Response:", res.data);
    console.log("=================================");

    handleAPIResponse(res, "Xóa quiz thành công!");
    return res.data;
  } catch (err) {
    return handleAPIError(err, "Không thể xóa quiz!");
  }
};
