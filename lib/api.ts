import axios from 'axios';

// API Base URL - Use Next.js API routes (same origin)
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're already on login pages or admin pages
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath.includes('/login') || currentPath.includes('/admin-login');
      const isAdminPage = currentPath.includes('/superadmin') || currentPath.includes('/admin/create');
      
      if (!isLoginPage && !isAdminPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect if not already on a login/admin page
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

