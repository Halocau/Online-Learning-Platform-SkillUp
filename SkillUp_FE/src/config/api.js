// API Configuration - Central place for all API endpoints
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
    TEST_TOKEN: '/auth/test-token',

    NEWS_CREATE: '/News/create-news',
    UPLOAD_IMAGE: '/upload/image',

    // Ticket endpoints
    ALL_TICKETS: '/Ticket/all-tickets',
    MY_TICKETS: '/Ticket/my-tickets',
    CREATE_TICKET: '/Ticket/create-ticket',
    GET_TICKET: '/Ticket',
    DETAIL_TICKET: '/Ticket/detail',
};


export const getApiUrl = (endpoint) => {
    const path = API_ENDPOINTS[endpoint] || endpoint;
    return `${API_BASE_URL}${path}`;
};


import axiosInstance from '../lib/axios';
export { axiosInstance };
