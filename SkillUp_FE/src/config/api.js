// API Configuration - Central place for all API endpoints
// Sử dụng environment variable nếu có, fallback về localhost cho development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5120/api';

// TinyMCE API Key - Lấy từ environment variable
export const TINYMCE_API_KEY = import.meta.env.VITE_TINYMCE_API_KEY || 'tv8otnk3960gtkqgy0sdo1csb22swjvc7bgco353p0967x7i';

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
    UPDATE_TICKET: '/Ticket/update-ticket',
    SOLVE_TICKETS: '/Ticket/solved-tickets',
    UNSOLVED_TICKETS: '/Ticket/unsolved-tickets',
    RESOLVE_TICKET: '/Ticket/resolve-ticket',
    SUGGEST_TICKET_TITLES: '/Ticket/suggest-titles',
    ACCOUNT_TICKETS: '/Ticket/account-tickets/{accountId}',

    // Lecturer Application endpoints
    MANAGE_LECTURER_APPLICATIONS: '/LecturerApplication/manage-lecturer-applications',
    UPDATE_STATUS_LECTURER_APPLICATION: '/LecturerApplication/manage-lecturer-applications/update-status',
    // Category endpoints
    CATEGORY_LIST: '/Category/GetAll',
    CATEGORY_CREATE: '/Category/Create',
    CATEGORY_UPDATE: '/Category/Update/{id}',
    CATEGORY_DELETE: '/Category/Delete/{id}',
    CATEGORY_ID: '/Category/GetById/{id}',

    //subcategory endpoints
    SUBCATEGORY_LIST: '/SubCategory/GetAll',
    SUBCATEGORY_CREATE: '/SubCategory/CreateSubCategory',
    SUBCATEGORY_UPDATE: '/SubCategory/UpdateSubCategory/{id}',
    SUBCATEGORY_DELETE: '/SubCategory/DeleteSubCategory/{id}',
    SUBCATEGORY_ID: '/SubCategory/GetByIdSubCategory/{id}',

    //cart endpoints
    CART: `/Cart/{accountId}`,
    ADD_TO_CART: '/Cart/AddToCart/{accountId}',
    REMOVE_FROM_CART: '/Cart/RemoveFromCart/{cartItemId}',
    CLEAR_CART: '/Cart/clear/{accountId}',

    //Question Bank endpoints
    GET_BY_ID: '/QuestionBank/getById/{questionBankId}',
    GET_BY_SECTION: '/QuestionBank/getBySection/{sectionId}',
    QUESTION_BANK_DELETE: '/QuestionBank/delete/{questionBankId}',
    QUESTION_BANK_CREATE: '/QuestionBank/create',
    QUESTION_BANK_UPDATE: '/QuestionBank/update/{questionBankId}',

    //Section endpoints
    GET_BY_COURSE: '/Sections/ByCourse/{courseId}',

    //Notification endpoints
    GET_MY_NOTIFICATIONS: '/Notify/GetMyNotifications',
    GET_NOTIFICATIONS_BY_ACCOUNT: '/Notify/GetByAccount/{accountId}',

    //Transaction endpoints
    PURCHASE_HISTORY: '/Transaction/history',
};


export const getApiUrl = (endpoint) => {
    const path = API_ENDPOINTS[endpoint] || endpoint;
    return `${API_BASE_URL}${path}`;
};


import axiosInstance from '@/lib/axios.js';
export { axiosInstance };
