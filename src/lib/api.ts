import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401/403 errors globally
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
       // Clear session on 401
       if (typeof window !== 'undefined') {
         localStorage.removeItem('token');
         localStorage.removeItem('user');
         // We might want to dispatch a logout action here if we had access to store
         // checking window.location.pathname ensures we don't loop redirect on login page
         if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
         }
       }
    }
    return Promise.reject(error);
  }
);

export default api;
