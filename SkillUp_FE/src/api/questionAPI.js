import { toast } from "react-toastify";
import axiosInstance from "../lib/axios";

const API_URL = "http://localhost:5120/api/Question";

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

// Add question to quiz
export const addQuestionToQuiz = async (questionData) => {
  try {
    const res = await axiosInstance.post(
      `${API_URL}/AddQuestionToQuiz`,
      questionData
    );

    console.log("Manual question added - Response:", res.data);
    console.log(" Question data sent:", questionData);
    return handleAPIResponse(res, "Thêm câu hỏi thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể thêm câu hỏi!");
  }
};

// Update question
export const updateQuestion = async (questionId, questionData) => {
  try {
    const res = await axiosInstance.put(
      `${API_URL}/UpdateQuestion/${questionId}`,
      questionData
    );
    handleAPIResponse(res, "Cập nhật câu hỏi thành công!");
    return res.data;
  } catch (err) {
    return handleAPIError(err, "Không thể cập nhật câu hỏi!");
  }
};

// Add questions from bank
export const addQuestionsFromBank = async (questions) => {
  try {
    const res = await axiosInstance.post(`${API_URL}/add-from-bank`, questions);
    console.log("Questions from bank added - Response:", res.data);
    console.log("Questions sent:", questions);
    return handleAPIResponse(res, "Thêm câu hỏi từ ngân hàng thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể thêm câu hỏi từ ngân hàng!");
  }
};
