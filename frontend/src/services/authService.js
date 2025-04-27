import axiosInstance from '../utils/axiosConfig';

const API_URL = '/auth';

export const authService = {
  login: async (email, password) => {
    try {
      console.log('Login attempt:', { email });
      
      const response = await axiosInstance.post(`${API_URL}/login`, { email, password });
      
      console.log('Login response:', {
        token: response.data.token ? 'EXISTS' : 'NOT EXISTS',
        user: response.data.data.user
      });
      
      if (response.data.token) {
        // Store user and token in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        localStorage.setItem('token', response.data.token);
        
        console.log('Stored in localStorage:', {
          user: response.data.data.user,
          token: 'EXISTS'
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Login failed:', {
        errorResponse: error.response ? error.response.data : error.message,
        errorStatus: error.response?.status
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('Logged out: cleared localStorage');
  },

  getCurrentUser: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('getCurrentUser:', { user });
    return user;
  }
};
