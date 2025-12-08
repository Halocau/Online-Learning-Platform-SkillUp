import { toast } from "react-toastify";
import axiosInstance from "../lib/axios";

const API_URL = "http://localhost:5120/api/Question";
const UPLOAD_URL = "http://localhost:5120/api/Upload";

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

// Upload image and get URL
export const uploadQuestionImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("image", imageFile);

    const res = await axiosInstance.post(`${UPLOAD_URL}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    let imageUrl = null;

    if (typeof res.data === "string") {
      imageUrl = res.data;
    } else if (res.data?.data) {
      if (Array.isArray(res.data.data)) {
        if (res.data.data.length > 0) {
          if (typeof res.data.data[0] === "string") {
            imageUrl = res.data.data[0];
          } else if (res.data.data[0].url) {
            imageUrl = res.data.data[0].url;
          } else if (res.data.data[0].imageUrl) {
            imageUrl = res.data.data[0].imageUrl;
          }
        }
      } else {
        if (typeof res.data.data === "string") {
          imageUrl = res.data.data;
        } else if (res.data.data.url) {
          imageUrl = res.data.data.url;
        } else if (res.data.data.imageUrl) {
          imageUrl = res.data.data.imageUrl;
        }
      }
    } else if (res.data?.url) {
      imageUrl = res.data.url;
    } else if (res.data?.imageUrl) {
      imageUrl = res.data.imageUrl;
    } else if (res.data?.path) {
      imageUrl = res.data.path;
    }

    if (imageUrl) {
      return imageUrl;
    } else {
      console.error("❌ No URL in response:", res.data);
      toast.error("Không thể lấy URL ảnh");
      return null;
    }
  } catch (err) {
    console.error("❌ Image upload failed:", err);
    const errorMsg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Lỗi khi tải ảnh lên. Vui lòng thử lại.";
    toast.error(errorMsg);
    return null;
  }
};

// Add question to quiz
export const addQuestionToQuiz = async (questionData) => {
  try {
    const formattedAnswers = questionData.answers.map((answer) => ({
      answerName: answer.answerName,
      isCorrect: answer.isCorrect,
      imageUrl: answer.imageUrl || "",
    }));

    const payload = {
      ...questionData,
      answers: formattedAnswers,
      imageUrl: questionData.imageUrl || "",
    };

    const res = await axiosInstance.post(
      `${API_URL}/AddQuestionToQuiz`,
      payload
    );

    return handleAPIResponse(res, "Thêm câu hỏi thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể thêm câu hỏi!");
  }
};

// Update question - API requires answerId for each answer
export const updateQuestion = async (questionId, questionData) => {
  try {
    const formattedAnswers = questionData.answers.map((answer) => ({
      answerId: answer.answerId || answer.id,
      answerName: answer.answerName,
      isCorrect: answer.isCorrect,
      imageUrl: answer.imageUrl || "",
    }));

    const payload = {
      quizId: questionData.quizId,
      title: questionData.title,
      description: questionData.description,
      type: questionData.type,
      imageUrl: questionData.imageUrl || "",
      answers: formattedAnswers,
    };

    const res = await axiosInstance.put(
      `${API_URL}/UpdateQuestionInQuiz/${questionId}`,
      payload
    );
    handleAPIResponse(res, "Cập nhật câu hỏi thành công!");
    return res.data;
  } catch (err) {
    return handleAPIError(err, "Không thể cập nhật câu hỏi!");
  }
};

// Delete question from quiz - NEW API CALL
export const deleteQuestionFromQuiz = async (quizId, questionId) => {
  try {
    const res = await axiosInstance.delete(
      `${API_URL}/RemoveQuestionFromQuiz/${quizId}/${questionId}`
    );
    handleAPIResponse(res, "Xóa câu hỏi thành công!");
    return res.data;
  } catch (err) {
    return handleAPIError(err, "Không thể xóa câu hỏi!");
  }
};

// Add questions from bank
export const addQuestionsFromBank = async (questions) => {
  try {
    const res = await axiosInstance.post(`${API_URL}/add-from-bank`, questions);
    return handleAPIResponse(res, "Thêm câu hỏi từ ngân hàng thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể thêm câu hỏi từ ngân hàng!");
  }
};
