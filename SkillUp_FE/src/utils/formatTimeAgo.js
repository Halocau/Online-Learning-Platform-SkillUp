/**
 * Format a date string to a human-readable "time ago" format in Vietnamese
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted time ago string
 */
export const formatTimeAgo = (dateString) => {
    if (!dateString) return "Gần đây";

    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInSeconds < 60) {
        return "Vừa xong";
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
        return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
        return `${diffInDays} ngày trước`;
    } else if (diffInWeeks < 4) {
        return `${diffInWeeks} tuần trước`;
    } else if (diffInMonths < 12) {
        return `${diffInMonths} tháng trước`;
    } else {
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }
};

