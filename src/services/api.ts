
import axios, { AxiosInstance } from 'axios';
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
    } else if (error.response?.status === 403) {
      // Handle forbidden errors
      toast.error('You do not have permission to perform this action.');
    } else if (error.response?.status === 429) {
      // Handle rate limiting
      toast.error('Too many requests. Please try again later.');
    } else {
      // Show general error toast for other errors
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Extend the api instance with a download function
const downloadFile = async (url: string, filename?: string) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    });
    
    // Create file link and trigger download
    const href = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', filename || 'download');
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    toast.error('Failed to download file.');
    return false;
  }
};

// Add the download method to the api object
const apiWithDownload = {
  ...api,
  download: downloadFile,
};

export default apiWithDownload;
