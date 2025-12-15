// src/api/voucherAPI.js
import axiosInstance from "@/lib/axios.js";

const API_BASE_URL = "/Voucher";

export const voucherAPI = {
    // Validate voucher code
    validateVoucher: async (couponCode, courseIds, totalPrice) => {
        try {
            // Đảm bảo courseIds là array và totalPrice là number
            const payload = {
                CouponCode: couponCode?.trim() || '',
                CourseIds: Array.isArray(courseIds) ? courseIds : [],
                TotalPrice: typeof totalPrice === 'number' ? totalPrice : parseFloat(totalPrice) || 0
            };

            const response = await axiosInstance.post(
                `${API_BASE_URL}/validate-code`,
                payload
            );
            return response;
        } catch (error) {
            console.error("Error validating voucher:", error);
            throw error;
        }
    },

    // Get voucher by ID
    getVoucherById: async (voucherId) => {
        try {
            const response = await axiosInstance.get(`${API_BASE_URL}/${voucherId}`);
            return response;
        } catch (error) {
            console.error("Error getting voucher:", error);
            throw error;
        }
    },

    // Get vouchers by course ID
    getCourseVouchers: async (courseId) => {
        try {
            const response = await axiosInstance.get(`${API_BASE_URL}/course-voucher/${courseId}`);
            return response;
        } catch (error) {
            console.error("Error getting course vouchers:", error);
            throw error;
        }
    },

    // Get vouchers by multiple course IDs (batch)
    getCourseVouchersBatch: async (courseIds) => {
        try {
            const response = await axiosInstance.post(
                `${API_BASE_URL}/course-vouchers-batch`,
                courseIds
            );
            return response;
        } catch (error) {
            console.error("Error getting course vouchers batch:", error);
            throw error;
        }
    },

    // Add new voucher
    addVoucher: async (voucherData) => {
        try {
            const response = await axiosInstance.post(
                `${API_BASE_URL}/add-voucher`,
                voucherData
            );
            return response;
        } catch (error) {
            console.error("Error adding voucher:", error);
            throw error;
        }
    },

    // Update voucher
    updateVoucher: async (voucherId, voucherData) => {
        try {
            const response = await axiosInstance.put(
                `${API_BASE_URL}/update-voucher/${voucherId}`,
                voucherData
            );
            return response;
        } catch (error) {
            console.error("Error updating voucher:", error);
            throw error;
        }
    },

    // Delete voucher
    deleteVoucher: async (voucherId) => {
        try {
            // Backend expects [FromBody] Guid
            // For DELETE requests with body, we need to send the Guid as a JSON string
            // .NET Core expects: "guid-string" (with quotes)
            const response = await axiosInstance.request({
                method: 'DELETE',
                url: `${API_BASE_URL}/delete-voucher`,
                data: voucherId, // Axios will automatically serialize this
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response;
        } catch (error) {
            console.error("Error deleting voucher:", error);
            throw error;
        }
    },

    // Get all voucher types
    getAllVoucherTypes: async () => {
        try {
            const response = await axiosInstance.get(`${API_BASE_URL}/voucher-types`);
            return response;
        } catch (error) {
            console.error("Error getting voucher types:", error);
            throw error;
        }
    }
};

