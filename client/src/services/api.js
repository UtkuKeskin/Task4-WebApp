import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:5038/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      const isLoginRequest = error.config.url === '/users/login';
      const isRegisterRequest = error.config.url === '/users/register';
      if (!isLoginRequest && !isRegisterRequest) {
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.Message ||
          'Session expired. Please log in again.';
        toast.error(errorMsg);
      }
    }
    return Promise.reject(error);
  }
);

export default api;