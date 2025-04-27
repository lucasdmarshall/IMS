import { apiService } from './apiService';

export const purchaseOrderService = {
  getAllPurchaseOrders: async () => {
    try {
      const response = await apiService.get('/purchase-orders');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch purchase orders');
    }
  },

  createPurchaseOrder: async (orderData) => {
    try {
      const response = await apiService.post('/purchase-orders', orderData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create purchase order');
    }
  },

  updatePurchaseOrder: async (id, orderData) => {
    try {
      const response = await apiService.put(`/purchase-orders/${id}`, orderData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update purchase order');
    }
  },

  deletePurchaseOrder: async (id) => {
    try {
      const response = await apiService.delete(`/purchase-orders/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete purchase order');
    }
  }
};
