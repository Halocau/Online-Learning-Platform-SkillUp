// Login Cart Merge Logic - Tích hợp guest cart vào login flow
import { mergeGuestCartToServer } from "@/utils/cartHelpers";

/**
 * Xử lý sau khi login thành công - merge guest cart
 * @param {number} userId - ID của user vừa đăng nhập
 * @returns {Promise<void>}
 */
export const handlePostLogin = async (userId) => {
    try {
        // Merge guest cart vào server cart
        await mergeGuestCartToServer(userId);
    } catch (error) {
        console.error("Error in post-login cart merge:", error);
        // Không throw error để không ảnh hưởng đến login flow
    }
};
