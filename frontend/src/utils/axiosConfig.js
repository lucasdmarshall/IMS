import axios from 'axios';
import { message } from 'antd';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001/api/v1',
  timeout: 10000,  // 10-second timeout
});

// Request interceptor to add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Calculate the full URL correctly - prevent duplication of /api/v1/
    let fullURL = '';
    if (config.url.startsWith('/')) {
      // If the URL starts with a slash, it's a relative URL
      fullURL = `${config.baseURL}${config.url}`;
    } else {
      // If the URL doesn't start with a slash, it might be a full URL
      fullURL = config.url.includes('http') ? config.url : `${config.baseURL}/${config.url}`;
    }
    
    console.log('Axios Request Interceptor FULL CONFIG:', {
      baseURL: config.baseURL,
      url: config.url,
      method: config.method,
      fullURL: fullURL,
      params: config.params,
      headers: config.headers
    });

    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Axios Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Axios Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Axios Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: error.config
    });

    // Handle unauthorized errors
    if (error.response && error.response.status === 401) {
      message.error('Session expired. Please log in again.');
      
      // Clear user data and redirect to login
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Redirect to login page
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
