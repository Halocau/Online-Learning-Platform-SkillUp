// API Configuration
export const API_BASE_URL = 'http://localhost:5120/api';

export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GOOGLE_LOGIN: '/auth/google-login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_OTP: '/auth/resend-otp',
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
    return `${API_BASE_URL}${endpoint}`;
};
