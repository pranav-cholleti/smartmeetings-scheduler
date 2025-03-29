
import axios from 'axios';
import { toast } from "sonner";

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If not already on login page, redirect
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    } else {
      // Show general error toast for other errors
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
