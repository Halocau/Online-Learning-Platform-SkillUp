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
    REMOVE_FROM_CART: '/Cart/RemoveFromCart/{cartItemId}'
};


export const getApiUrl = (endpoint) => {
    const path = API_ENDPOINTS[endpoint] || endpoint;
    return `${API_BASE_URL}${path}`;
};


import axiosInstance from '../lib/axios';
export { axiosInstance };
