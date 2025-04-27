import { apiService } from './apiService';

export const supplierService = {
  getAllSuppliers: async () => {
    try {
      const response = await apiService.get('/suppliers');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch suppliers');
    }
  },

  createSupplier: async (supplierData) => {
    try {
      const response = await apiService.post('/suppliers', supplierData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create supplier');
    }
  },

  updateSupplier: async (id, supplierData) => {
    try {
      const response = await apiService.put(`/suppliers/${id}`, supplierData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update supplier');
    }
  },

  deleteSupplier: async (id) => {
    try {
      const response = await apiService.delete(`/suppliers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete supplier');
    }
  }
};
