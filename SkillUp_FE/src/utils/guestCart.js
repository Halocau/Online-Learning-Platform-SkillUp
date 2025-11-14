// Guest Cart Utilities - Handle cart operations for non-logged-in users
const GUEST_CART_KEY = 'skillup_guest_cart';

/**
 * Lấy giỏ hàng của guest từ localStorage
 * @returns {Array} Mảng các items trong cart [{courseId, price, addedAt}]
 */
export const getGuestCart = () => {
    try {
        const cart = localStorage.getItem(GUEST_CART_KEY);
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error('Error getting guest cart:', error);
        return [];
    }
};

/**
 * Thêm khóa học vào giỏ hàng guest
 * @param {number} courseId - ID của khóa học
 * @param {number} price - Giá khóa học
 * @returns {boolean} true luôn (để hiển thị thông báo thành công)
 */
export const addToGuestCart = (courseId, price) => {
    try {
        const cart = getGuestCart();
        
        // Kiểm tra xem course đã có trong cart chưa
        const existingIndex = cart.findIndex(item => item.courseId === courseId);
        if (existingIndex !== -1) {
            // Đã có trong cart - không thêm nữa nhưng vẫn return true
            return true;
        }
        
        // Thêm item mới
        cart.push({
            courseId,
            price,
            addedAt: new Date().toISOString()
        });
        
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
        return true;
    } catch (error) {
        console.error('Error adding to guest cart:', error);
        return false;
    }
};

/**
 * Xóa khóa học khỏi giỏ hàng guest
 * @param {number} courseId - ID của khóa học cần xóa
 * @returns {boolean} true nếu thành công
 */
export const removeFromGuestCart = (courseId) => {
    try {
        const cart = getGuestCart();
        const updatedCart = cart.filter(item => item.courseId !== courseId);
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updatedCart));
        return true;
    } catch (error) {
        console.error('Error removing from guest cart:', error);
        return false;
    }
};

/**
 * Xóa toàn bộ giỏ hàng guest
 * @returns {boolean} true nếu thành công
 */
export const clearGuestCart = () => {
    try {
        localStorage.removeItem(GUEST_CART_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing guest cart:', error);
        return false;
    }
};

/**
 * Lấy số lượng items trong giỏ hàng guest
 * @returns {number} Số lượng items
 */
export const getGuestCartCount = () => {
    const cart = getGuestCart();
    return cart.length;
};
