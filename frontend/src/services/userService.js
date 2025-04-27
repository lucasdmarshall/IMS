import axios from 'axios';

const API_URL = 'http://localhost:5001/api/v1/users';

// Get the token from local storage
const getToken = () => {
  return localStorage.getItem('token');
};

export const userService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get a single user by ID
  getUserById: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/${userId}`, {
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data.user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Get all staff users
  getStaff: async () => {
    try {
      const response = await axios.get(`${API_URL}/staff`, {
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data.users;
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  },

  // Create a new user
  createUser: async (userData) => {
    try {
      const response = await axios.post(API_URL, userData, {
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data.user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update a user
  updateUser: async (userId, userData) => {
    try {
      const response = await axios.patch(`${API_URL}/${userId}`, userData, {
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data.user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete a user
  deleteUser: async (userId) => {
    try {
      await axios.delete(`${API_URL}/${userId}`, {
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};
