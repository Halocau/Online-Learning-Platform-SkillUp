// Định dạng tiền tệ
export const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Định dạng số (cho rating/enrollment)
export const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
};



