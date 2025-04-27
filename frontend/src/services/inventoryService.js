import { apiService } from './apiService';

export const inventoryService = {
  getStockReport: async () => {
    try {
      const response = await apiService.get('reports/stock');
      return response;
    } catch (error) {
      console.error('Stock Report Error:', error.response ? error.response.data : error);
      throw new Error(error.response?.data?.message || 'Failed to fetch stock report');
    }
  }
};
