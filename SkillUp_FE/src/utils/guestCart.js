// src/utils/guestCart.js
// Quản lý giỏ hàng cho người dùng chưa đăng nhập (guest)

const GUEST_CART_KEY = 'skillup_guest_cart';

/**
 * Lấy giỏ hàng guest từ localStorage
 * @returns {Array} Mảng các item trong giỏ hàng
 */
export const getGuestCart = () => {
    try {
        const cart = localStorage.getItem(GUEST_CART_KEY);
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error('Error reading guest cart:', error);
        return [];
    }
};

/**
 * Lưu giỏ hàng guest vào localStorage
 * @param {Array} cart - Mảng các item giỏ hàng
 */
export const saveGuestCart = (cart) => {
    try {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving guest cart:', error);
    }
};

/**
 * Thêm một khóa học vào giỏ hàng guest
 * @param {string} courseId - ID của khóa học
 * @param {number} price - Giá của khóa học
 * @returns {boolean} True nếu thêm thành công
 */
export const addToGuestCart = (courseId, price) => {
    try {
        console.log('addToGuestCart called with:', { courseId, price }); // Debug log
        const cart = getGuestCart();

        // Kiểm tra xem khóa học đã tồn tại chưa
        const existingItem = cart.find(item => item.courseId === courseId);
        if (existingItem) {
            console.log('Course already in cart'); // Debug log
            return true; // Đã tồn tại, không thêm nữa
        }

        // Thêm item mới
        const newItem = {
            courseId,
            price: price || 0,
            addedAt: new Date().toISOString()
        };
        console.log('Adding new item to guest cart:', newItem); // Debug log
        cart.push(newItem);

        saveGuestCart(cart);
        console.log('Guest cart after add:', cart); // Debug log
        return true;
    } catch (error) {
        console.error('Error adding to guest cart:', error);
        return false;
    }
};

/**
 * Xóa một khóa học khỏi giỏ hàng guest
 * @param {string} courseId - ID của khóa học cần xóa
 */
export const removeFromGuestCart = (courseId) => {
    try {
        const cart = getGuestCart();
        const updatedCart = cart.filter(item => item.courseId !== courseId);
        saveGuestCart(updatedCart);
    } catch (error) {
        console.error('Error removing from guest cart:', error);
    }
};

/**
 * Xóa toàn bộ giỏ hàng guest
 */
export const clearGuestCart = () => {
    try {
        localStorage.removeItem(GUEST_CART_KEY);
    } catch (error) {
        console.error('Error clearing guest cart:', error);
    }
};

/**
 * Đếm số lượng item trong giỏ hàng guest
 * @returns {number} Số lượng item
 */
export const getGuestCartCount = () => {
    const cart = getGuestCart();
    return cart.length;
};

/**
 * Kiểm tra xem một khóa học có trong giỏ hàng guest không
 * @param {string} courseId - ID của khóa học
 * @returns {boolean} True nếu có trong giỏ hàng
 */
export const isInGuestCart = (courseId) => {
    const cart = getGuestCart();
    return cart.some(item => item.courseId === courseId);
};
