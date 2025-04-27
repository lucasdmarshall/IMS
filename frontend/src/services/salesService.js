import { apiService } from './apiService';

export const salesService = {
  getSalesReport: async () => {
    try {
      const response = await apiService.get('reports/sales');
      return response;
    } catch (error) {
      console.error('Sales Report Error:', error.response ? error.response.data : error);
      throw new Error(error.response?.data?.message || 'Failed to fetch sales report');
    }
  }
};
