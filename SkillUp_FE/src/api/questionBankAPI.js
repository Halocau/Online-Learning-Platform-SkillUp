import { toast } from "react-toastify";
import axiosInstance from "../lib/axios";

const API_URL = "http://localhost:5120/api/QuestionBank";

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

// Create question in bank
export const createQuestionBank = async (questionData) => {
  try {
    const res = await axiosInstance.post(`${API_URL}/create`, questionData);
    return handleAPIResponse(res, "Tạo câu hỏi trong ngân hàng thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể tạo câu hỏi!");
  }
};

// Update question in bank
export const updateQuestionBank = async (questionBankId, questionData) => {
  try {
    const res = await axiosInstance.put(
      `${API_URL}/update/${questionBankId}`,
      questionData
    );
    handleAPIResponse(res, "Cập nhật câu hỏi thành công!");
    return res.data;
  } catch (err) {
    return handleAPIError(err, "Không thể cập nhật câu hỏi!");
  }
};

// Delete question from bank
export const deleteQuestionBank = async (questionBankId) => {
  try {
    const res = await axiosInstance.delete(
      `${API_URL}/delete/${questionBankId}`
    );
    handleAPIResponse(res, "Xóa câu hỏi khỏi ngân hàng thành công!");
    return res.data;
  } catch (err) {
    return handleAPIError(err, "Không thể xóa câu hỏi!");
  }
};

// Get questions by section - FIXED for nested array
export const getQuestionsBySection = async (sectionId, courseId) => {
  try {
    const res = await axiosInstance.get(
      `${API_URL}/getBySection/${sectionId}`,
      {
        params: { courseId },
      }
    );
    let questions = res.data?.data ?? [];

    if (Array.isArray(questions) && questions.length > 0) {
      if (Array.isArray(questions[0])) {
        questions = questions[0]; // Take the inner array
      }
    }

    return questions;
  } catch (err) {
    return [];
  }
};

// Get question by ID
export const getQuestionBankById = async (questionBankId, courseId) => {
  try {
    const res = await axiosInstance.get(
      `${API_URL}/getById/${questionBankId}`,
      {
        params: { courseId },
      }
    );
    return res.data?.data ?? null;
  } catch (err) {
    console.error("Error getting question by ID:", err);
    return null;
  }
};
