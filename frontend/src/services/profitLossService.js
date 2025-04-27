import { apiService } from './apiService';

export const profitLossService = {
  getProfitLossReport: async () => {
    try {
      const response = await apiService.get('reports/profit_loss');
      return response;
    } catch (error) {
      console.error('Profit/Loss Report Error:', error.response ? error.response.data : error);
      throw new Error(error.response?.data?.message || 'Failed to fetch profit/loss report');
    }
  }
};
