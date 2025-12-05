// Login Cart Merge Logic - Tích hợp guest cart vào login flow
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
