import axiosInstance from '../utils/axiosConfig';

const API_URL = '/products';

export const productService = {
  // Get all products
  getAllProducts: async () => {
    try {
      const response = await axiosInstance.get(API_URL);
      return response.data.data.products;
    } catch (error) {
      console.error('Detailed Error fetching products:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  },

  // Get a single product by ID
  getProductById: async (productId) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/${productId}`);
      return response.data.data.product;
    } catch (error) {
      console.error('Detailed Error fetching product:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  },

  // Create a new product
  createProduct: async (productData) => {
    try {
      const response = await axiosInstance.post(API_URL, productData);
      return response.data.data.product;
    } catch (error) {
      console.error('Detailed Error creating product:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  },

  // Update a product
  updateProduct: async (productId, productData) => {
    try {
      const response = await axiosInstance.patch(`${API_URL}/${productId}`, productData);
      return response.data.data.product;
    } catch (error) {
      console.error('Detailed Error updating product:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (productId) => {
    try {
      await axiosInstance.delete(`${API_URL}/${productId}`);
      return true;
    } catch (error) {
      console.error('Detailed Error deleting product:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  }
};

// Direct export of getAllProducts for easier import
export const getAllProducts = productService.getAllProducts;
