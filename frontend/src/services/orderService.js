import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1';

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const orderService = {
  async getAllOrders() {
    try {
      console.log('Fetching orders from:', `${BASE_URL}/orders`);
      console.log('Auth Config:', getAuthConfig());
      const response = await axios.get(`${BASE_URL}/orders`, getAuthConfig());
      console.log('Order Response:', response);
      return response.data.data.orders;
    } catch (error) {
      console.error('Detailed Order Fetch Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers
      });
      throw error;
    }
  },

  async getManagerOrders() {
    try {
      console.log('Fetching All Orders');
      
      const response = await axios.get(`${BASE_URL}/orders`, getAuthConfig());
      
      console.log('Orders Response:', {
        status: response.status,
        orderCount: response.data.results,
        orders: response.data.data.orders
      });
      
      return response.data.data.orders;
    } catch (error) {
      console.error('Order Fetch Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async getStaffOrders(staffId) {
    try {
      console.log('Fetching staff orders from:', `${BASE_URL}/orders/staff/${staffId}`);
      console.log('Staff ID:', staffId);
      console.log('Auth Config:', getAuthConfig());
      
      const response = await axios.get(`${BASE_URL}/orders/staff/${staffId}`, getAuthConfig());
      
      console.log('Staff Order Response:', response);
      return response.data.data.orders;
    } catch (error) {
      console.error('Detailed Staff Order Fetch Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers
      });
      throw error;
    }
  },

  async createOrder(orderData) {
    try {
      console.log('Creating order at:', `${BASE_URL}/orders`);
      console.log('Auth Config:', getAuthConfig());
      console.log('Order Data:', orderData);
      
      // Validate order data before sending
      if (!orderData.assignedTo) {
        console.warn('Warning: No assignedTo value provided');
      }
      
      const response = await axios.post(`${BASE_URL}/orders`, orderData, getAuthConfig());
      
      console.log('Order Creation Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      
      return response.data.data.order;
    } catch (error) {
      console.error('Detailed Order Creation Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers,
        requestData: orderData
      });
      throw error;
    }
  },

  async updateOrder(orderId, orderData) {
    try {
      // Normalize payment status
      const normalizedOrderData = { ...orderData };
      if (normalizedOrderData.paymentStatus) {
        normalizedOrderData.paymentStatus = normalizedOrderData.paymentStatus
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('-')
          .replace('half-Paid', 'Half-Paid');
      }

      // Validate order data before sending
      if (!normalizedOrderData.assignedTo) {
        console.warn('Warning: No assignedTo value provided for update');
        throw new Error('Staff member must be assigned');
      }

      console.log('Updating order:', {
        orderId,
        orderData: normalizedOrderData
      });

      const response = await axios.put(
        `${BASE_URL}/orders/${orderId}`, 
        normalizedOrderData, 
        getAuthConfig()
      );
      
      console.log('Order update response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      
      // Log the updated order details
      console.log('Updated Order Details:', {
        orderId: response.data.data.order._id,
        customerName: response.data.data.order.customerName,
        assignedTo: response.data.data.order.assignedTo,
        status: response.data.data.order.status
      });
      
      return response.data.data.order;
    } catch (error) {
      console.error('Detailed Order Update Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers,
        requestData: orderData
      });
      throw error;
    }
  },

  async deleteOrder(orderId) {
    try {
      console.log('Deleting order at:', `${BASE_URL}/orders/${orderId}`);
      console.log('Auth Config:', getAuthConfig());
      const response = await axios.delete(`${BASE_URL}/orders/${orderId}`, getAuthConfig());
      console.log('Order Deletion Response:', response);
      return response.data;
    } catch (error) {
      console.error('Detailed Order Deletion Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers
      });
      throw error;
    }
  }
};
