import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios.js";
import { API_BASE_URL } from "@/config/api";

const API_URL = `${API_BASE_URL}/Quiz`;

const handleAPIResponse = (
  res,
  defaultSuccessMsg = "Thành công!",
  showToast = true
) => {
  const apiRes = res.data;
  if (apiRes?.code >= 200 && apiRes?.code < 300) {
    if (showToast) {
      toast.success(apiRes?.message || defaultSuccessMsg);
    }
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
  const msg = err.response?.data?.message || err.message || defaultErrorMsg;
  toast.error(msg);
  throw err;
};

// Get quiz by ID
export const getQuizById = async (quizId) => {
  try {
    const res = await axiosInstance.get(`${API_URL}/View-Quiz/${quizId}`);
    return handleAPIResponse(res, "", false); // No toast for read operations
  } catch (err) {
    return handleAPIError(err, "Không thể tải quiz!");
  }
};

// Create new quiz
export const createQuiz = async (quizData) => {
  try {
    // Validate
    if (!quizData.sectionId) {
      throw new Error("SectionId is required");
    }
    if (!quizData.title || quizData.title.trim() === "") {
      throw new Error("Title is required");
    }

    // Build payload
    const payload = {
      sectionId: String(quizData.sectionId),
      title: String(quizData.title).trim(),
      description: quizData.description
        ? String(quizData.description).trim()
        : "",
      passPercent: Number(quizData.passPercent),
      timer: Number(quizData.timer),
    };


    if (quizData.orders !== undefined && quizData.orders !== null) {
      payload.orders = Number(quizData.orders);
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

    const res = await axiosInstance.post(`${API_URL}/Add-Quiz`, payload);

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

    const res = await axiosInstance.put(
      `${API_URL}/Update-Quiz/${quizId}`,
      payload
    );

    handleAPIResponse(res, "Cập nhật quiz thành công!");
    return res.data;
  } catch (err) {
    return handleAPIError(err, "Không thể cập nhật quiz!");
  }
};

// Delete quiz
export const deleteQuiz = async (quizId) => {
  try {
    const res = await axiosInstance.delete(`${API_URL}/Delete-Quiz/${quizId}`);
    handleAPIResponse(res, "Xóa quiz thành công!");
    return res.data;
  } catch (err) {
    return handleAPIError(err, "Không thể xóa quiz!");
  }
};

// Get quiz result by submission ID
export const getQuizResult = async (submissionId) => {
  try {
    const res = await axiosInstance.get(`${API_URL}/results/${submissionId}`);
    return handleAPIResponse(res, "", false); // No toast for read operations
  } catch (err) {
    return handleAPIError(err, "Không thể tải kết quả quiz!");
  }
};

// Start quiz
export const startQuiz = async (quizId) => {
  try {
    const res = await axiosInstance.post(`${API_URL}/${quizId}/start`);
    return handleAPIResponse(res, "", false);
  } catch (err) {
    return handleAPIError(err, "Không thể bắt đầu quiz!");
  }
};

// Submit quiz answers
export const submitQuiz = async (submissionId, answers) => {
  try {
    const payload = {
      answers: answers.map((answer) => ({
        questionId: answer.questionId,
        selectedAnswerIds: answer.selectedAnswerIds,
      })),
    };

    const res = await axiosInstance.post(
      `${API_URL}/submit/${submissionId}`,
      payload
    );
    return handleAPIResponse(res, "Nộp bài thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể nộp bài!");
  }
};
