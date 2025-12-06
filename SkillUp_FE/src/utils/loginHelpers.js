// Login Cart Merge Logic - Tích hợp guest cart vào login flow
import { isLecturerProfileComplete, lecturerAPI } from "@/api/lecturerAPI";
import { mergeGuestCartToServer } from "@/utils/cartHelpers";

/**
 * Xử lý sau khi login thành công - merge guest cart
 * @param {number} userId - ID của user vừa đăng nhập
 * @param {object|null} user - User object để kiểm tra role
 * @returns {Promise<void>}
 */
export const handlePostLogin = async (userId, user = null) => {
  try {
    // Merge guest cart vào server cart (chỉ cho Student)
    await mergeGuestCartToServer(userId, user);
  } catch (error) {
    console.error("Error in post-login cart merge:", error);
    // Không throw error để không ảnh hưởng đến login flow
  }
};

export const checkLecturerProfileCompletion = async (user) => {
  // Only check for Lecturers
  if (!user) {
    return null;
  }

  if (user.role !== "Lecturer") {
    return null;
  }

  try {
    const response = await lecturerAPI.getLecturerProfileByAccount(user.userId);

    if (
      response.data.code === 200 &&
      response.data.data &&
      response.data.data.length > 0
    ) {
      const lecturerData = response.data.data[0];

      // Use helper function to check if profile is complete
      const isComplete = isLecturerProfileComplete(lecturerData);

      if (!isComplete) {
        return "/lecturer/profile";
      }

      return null;
    }

    return "/lecturer/profile";
  } catch (error) {
    if (error.response?.status === 404) {
      return "/lecturer/profile";
    }

    return null;
  } finally {
  }
};
