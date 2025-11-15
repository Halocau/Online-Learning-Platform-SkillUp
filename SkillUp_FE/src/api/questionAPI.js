import { toast } from "react-toastify";
import axiosInstance from "../lib/axios";

const API_URL = "http://localhost:5120/api/Question";
const UPLOAD_URL = "http://localhost:5120/api/Upload";

const handleAPIResponse = (res, defaultSuccessMsg = "Thành công!", showToast = true) => {
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

// ============================================
// IMAGE UPLOAD
// ============================================

// Upload image and get URL
export const uploadQuestionImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("image", imageFile); // Some backends use "image"

    const res = await axiosInstance.post(`${UPLOAD_URL}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Extract URL from various response formats
    let imageUrl = null;

    if (typeof res.data === "string") {
      // Direct URL string
      imageUrl = res.data;
    } else if (res.data?.data) {
      // Check if data is an array
      if (Array.isArray(res.data.data)) {
        // Get first item from array
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
        // data is not an array
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
      toast.success("Ảnh đã được tải lên!");
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

// ============================================
// QUESTION OPERATIONS
// ============================================

// Add question to quiz (with optional image)
export const addQuestionToQuiz = async (questionData) => {
  try {
    const res = await axiosInstance.post(
      `${API_URL}/AddQuestionToQuiz`,
      questionData
    );

    return handleAPIResponse(res, "Thêm câu hỏi thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể thêm câu hỏi!");
  }
};

// Update question
export const updateQuestion = async (questionId, questionData) => {
  try {
    const res = await axiosInstance.put(
      `${API_URL}/UpdateQuestionInQuiz/${questionId}`,
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
    return handleAPIResponse(res, "Thêm câu hỏi từ ngân hàng thành công!");
  } catch (err) {
    return handleAPIError(err, "Không thể thêm câu hỏi từ ngân hàng!");
  }
};
