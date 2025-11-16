// Cart Context Enhancement - Guest cart support
import { getGuestCart, addToGuestCart, clearGuestCart, getGuestCartCount } from "@/utils/guestCart";
import { cartAPI } from "@/api/cartAPI";
import { courseAPI } from "@/api/courseAPI";

/**
 * Merge guest cart vào server cart khi user đăng nhập
 * @param {number} userId - ID của user vừa đăng nhập
 * @returns {Promise<boolean>} true nếu merge thành công
 */
export const mergeGuestCartToServer = async (userId) => {
    try {
        const guestCart = getGuestCart();

        if (guestCart.length === 0) {
            return true; // Không có gì để merge
        }

        console.log('Merging guest cart to server:', guestCart);

        // Sử dụng bulk-add API
        const response = await cartAPI.bulkAddToCart(userId, guestCart);

        if (response.data.code === 200) {
            console.log('Bulk-add response:', response.data);
            // Clear guest cart sau khi merge thành công
            clearGuestCart();
            return true;
        }

        return false;
    } catch (error) {
        console.error("Error merging guest cart to server:", error);
        // Vẫn clear guest cart ngay cả khi có lỗi để tránh duplicate
        clearGuestCart();
        return false;
    }
};

/**
 * Kiểm tra xem user đã đăng ký khóa học chưa
 * @param {string|Guid} courseId - ID khóa học
 * @returns {Promise<boolean>} true nếu đã enrolled
 */
const checkEnrollment = async (courseId) => {
    try {
        const response = await courseAPI.getStudentEnrolledCourses();
        if (response.data?.code === 200 && response.data?.data?.[0]) {
            const enrolledCourses = response.data.data[0];
            // Kiểm tra xem courseId có trong danh sách enrolled không
            return enrolledCourses.some(
                course => course.courseId === courseId ||
                    course.id === courseId ||
                    course.course?.id === courseId ||
                    course.course?.courseId === courseId
            );
        }
        return false;
    } catch (error) {
        console.error("Error checking enrollment:", error);
        // Nếu có lỗi khi check, cho phép thêm vào cart (fail-safe)
        return false;
    }
};

/**
 * Thêm sản phẩm vào cart (tự động phân biệt guest/logged-in)
 * @param {number} courseId - ID khóa học
 * @param {number} price - Giá khóa học
 * @param {object|null} user - User object (null nếu guest)
 * @returns {Promise<object>} {success, message}
 */
export const addToCartUnified = async (courseId, price, user = null) => {
    try {
        console.log('🔧 addToCartUnified called with:', { courseId, price, user }); // DEBUG

        if (!user || !user.userId) {
            // Guest user - add to localStorage
            addToGuestCart(courseId, price); // Luôn return true (check trùng ở bên trong)
            return { success: true, message: "Đã thêm vào giỏ hàng" };
        } else {
            // Logged-in user - check enrollment trước
            const isEnrolled = await checkEnrollment(courseId);
            if (isEnrolled) {
                return {
                    success: false,
                    message: "Bạn đã đăng ký khóa học này rồi. Không thể thêm vào giỏ hàng."
                };
            }

            // Logged-in user - add to server
            console.log('📡 Calling API with userId:', user.userId); // DEBUG
            const response = await cartAPI.addToCart(user.userId, courseId, price);
            if (response.data.code === 200) {
                return { success: true, message: "Đã thêm vào giỏ hàng" };
            } else {
                return { success: false, message: response.data.message || "Không thể thêm vào giỏ hàng" };
            }
        }
    } catch (error) {
        console.error("Error adding to cart:", error);

        // Kiểm tra nếu lỗi là do đã enrolled (từ backend)
        if (error.response?.data?.message?.toLowerCase().includes('đã đăng ký') ||
            error.response?.data?.message?.toLowerCase().includes('enrolled')) {
            return {
                success: false,
                message: "Bạn đã đăng ký khóa học này rồi. Không thể thêm vào giỏ hàng."
            };
        }

        return {
            success: false,
            message: error.response?.data?.message || "Đã có lỗi xảy ra"
        };
    }
};

/**
 * Lấy số lượng items trong cart (tự động phân biệt guest/logged-in)
 * @param {object|null} user - User object (null nếu guest)
 * @returns {Promise<number>} Số lượng items
 */
export const getCartCountUnified = async (user = null) => {
    try {
        if (!user || !user.userId) {
            // Guest user - count from localStorage
            return getGuestCartCount();
        } else {
            // Logged-in user - fetch from server
            const response = await cartAPI.getCart(user.userId);
            if (response.data.code === 200) {
                const items = response.data.data[0]?.cartItems || [];
                return items.length;
            }
            return 0;
        }
    } catch (error) {
        console.error("Error getting cart count:", error);
        return 0;
    }
};
