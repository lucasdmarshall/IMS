import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Normalize URL to remove any duplicate base paths
    if (config.url) {
      // Remove any leading slashes
      let cleanUrl = config.url.replace(/^\/+/, '');
      
      // Remove any duplicate base URL segments
      if (cleanUrl.startsWith('api/v1/')) {
        cleanUrl = cleanUrl.replace(/^api\/v1\//, '');
      }
      
      // Reconstruct the full URL
      config.url = `/${cleanUrl}`;
    }

    console.log('Normalized Request Config:', {
      url: config.url,
      baseURL: config.baseURL,
      method: config.method,
      headers: config.headers
    });

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  get: async (url) => {
    try {
      console.log(`Attempting to fetch: ${url}`);
      const response = await axiosInstance.get(url);
      console.log('Response received:', response);
      return response;
    } catch (error) {
      console.error('API GET Error:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  post: async (url, data) => {
    try {
      console.log(`Attempting to post to: ${url}`, data);
      const response = await axiosInstance.post(url, data);
      console.log('Response received:', response);
      return response;
    } catch (error) {
      console.error('API POST Error:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  put: async (url, data) => {
    try {
      return await axiosInstance.put(url, data);
    } catch (error) {
      throw error;
    }
  },

  delete: async (url) => {
    try {
      return await axiosInstance.delete(url);
    } catch (error) {
      throw error;
    }
  },
};
