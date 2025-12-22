import axios from 'axios';
import { saveUserFromToken } from './auth-utils';


// Sử dụng environment variable nếu có, fallback về localhost cho development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5120/api';
const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  GOOGLE_LOGIN: '/auth/google-login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_OTP: '/auth/resend-otp',
  TEST_TOKEN: '/auth/test-token',
};

// Tạo axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Flag để tránh multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request Interceptor: Tự động thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Xử lý 401 và tự động refresh token
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {

      // Nếu request là refresh-token hoặc login, không retry
      if (originalRequest.url?.includes('/auth/refresh-token') ||
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/google-login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Nếu đang refresh, đợi trong queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        handleLogout();
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh token
        const response = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.REFRESH_TOKEN}`,
          {
            accessToken: localStorage.getItem('accessToken'),
            refreshToken: refreshToken
          }
        );

        // Backend trả data dạng array [{tokens: {accessToken, refreshToken}}]
        const tokenData = response.data.data[0].tokens;
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = tokenData;

        // Lưu token mới
        saveUserFromToken(newAccessToken, newRefreshToken);

        // Update token cho request ban đầu
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Process queue
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Retry request ban đầu
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function để logout
const handleLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('userId');
  
  // Clear guest cart khi logout
  try {
    localStorage.removeItem('skillup_guest_cart');
  } catch (error) {
    console.error('Error clearing guest cart:', error);
  }

  // Redirect về trang login
  window.location.href = '/login';
};

export default axiosInstance;
