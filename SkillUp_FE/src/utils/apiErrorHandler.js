import { toast } from "react-toastify";

/**
 * Xử lý lỗi API và hiển thị thông báo phù hợp
 * @param {Error} error - Error object từ axios
 * @param {string} defaultMessage - Message mặc định nếu không có error message từ server
 * @returns {string} Error message đã được xử lý
 */
export const handleAPIError = (error, defaultMessage = "Đã có lỗi xảy ra!") => {
  console.error("API Error:", error);
  console.error("Response data:", error.response?.data);

  // Xử lý validation errors từ backend (400 Bad Request với errors object)
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    // Lấy tất cả error messages
    const errorMessages = [];
    
    Object.keys(errors).forEach(key => {
      if (Array.isArray(errors[key])) {
        errorMessages.push(...errors[key]);
      } else {
        errorMessages.push(errors[key]);
      }
    });

    if (errorMessages.length > 0) {
      // Hiển thị error đầu tiên (hoặc có thể hiển thị tất cả)
      const errorMsg = errorMessages[0];
      toast.error(errorMsg);
      return errorMsg;
    }
  }

  // Xử lý message thông thường
  const errorMsg = 
    error.response?.data?.message || 
    error.response?.data?.title ||
    error.message || 
    defaultMessage;
  
  toast.error(errorMsg);
  return errorMsg;
};

/**
 * Xử lý response thành công từ API
 * @param {object} response - Response object từ axios
 * @param {string} defaultSuccessMsg - Message mặc định cho trường hợp thành công
 * @returns {any} Data từ response
 */
export const handleAPIResponse = (response, defaultSuccessMsg = "Thành công!") => {
  const apiRes = response.data;
  
  if (apiRes?.code >= 200 && apiRes?.code < 300) {
    toast.success(apiRes?.message || defaultSuccessMsg);
  } else {
    toast.error(apiRes?.message || "Đã xảy ra lỗi!");
  }
  
  return apiRes?.data ?? [];
};
