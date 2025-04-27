import React, { useState, useEffect, useContext } from 'react';
import { 
  Table, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Tag, 
  Button, 
  Tooltip,
  Row,
  Col,
  Card,
  Divider,
  Badge,
  Space,
  Typography,
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  NotificationOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { userService } from '../../services/userService';
import axios from 'axios';

const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isStatusNotificationModalVisible, setIsStatusNotificationModalVisible] = useState(false);
  const [selectedOrderForNotification, setSelectedOrderForNotification] = useState(null);
  const { user } = useAuth();

  // Fetch orders based on user role
  const fetchOrders = async () => {
    try {
      let orders;
      switch (user.role) {
        case 'admin':
          orders = await orderService.getAllOrders();
          break;
        case 'manager':
          orders = await orderService.getManagerOrders();
          break;
        case 'staff':
          orders = await orderService.getStaffOrders(user.id);
          break;
        default:
          throw new Error('Invalid user role');
      }
      
      console.log('Fetched orders:', orders);
      
      // Make sure we have the latest data
      await fetchUsers();
      
      setOrders(orders);
    } catch (error) {
      message.error('Failed to fetch orders');
      console.error('Order fetch error:', error);
    }
  };

  // Fetch users for assignment dropdown
  const fetchUsers = async () => {
    try {
      const users = await userService.getAllUsers();
      setUsers(users);
    } catch (error) {
      message.error('Failed to fetch users');
      console.error('Users fetch error:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, [user]);

  // Consolidate order creation/update logic
  const handleCreateOrder = async (values) => {
    try {
      // Normalize payment status to ensure exact match with backend validation
      const normalizedPaymentStatus = (() => {
        switch(values.paymentStatus) {
          case 'Half Paid':
            return 'Half-Paid';
          case 'Paid':
            return 'Paid';
          case 'Unpaid':
            return 'Unpaid';
          default:
            return 'Unpaid'; // Default fallback
        }
      })();

      // Find staff users
      const staffUsers = users.filter(u => u.role === 'staff');
      
      // Ensure a staff member is assigned
      const assignedStaffId = values.assignedTo || 
        (staffUsers.length > 0 ? staffUsers[0]._id : user.id);

      // Debug: Log all available users
      console.log('Available users:', users);
      console.log('Current user:', user);
      console.log('Staff users:', staffUsers);
      console.log('Assigned staff ID:', assignedStaffId);

      // Prepare order data, ensuring assignedTo is correctly set
      const orderData = {
        customerName: values.customerName,
        totalAmount: Number(values.totalAmount),
        paymentStatus: normalizedPaymentStatus,
        status: values.status.toLowerCase(),
        description: values.description || '',
        managerId: user.id,
        assignedTo: assignedStaffId
      };
      
      console.log('Order data being sent:', orderData);
      console.log('Form values:', values);
      console.log('Assigned to value:', assignedStaffId);

      setLoading(true);

      let updatedOrCreatedOrder;
      if (currentOrder) {
        // Update existing order
        console.log(`Updating order ${currentOrder._id} with data:`, orderData);
        updatedOrCreatedOrder = await orderService.updateOrder(currentOrder._id, orderData);
        console.log('Updated order response:', updatedOrCreatedOrder);
        message.success('Order updated successfully');
      } else {
        // Create new order
        console.log('Creating new order with data:', orderData);
        updatedOrCreatedOrder = await orderService.createOrder(orderData);
        console.log('Created order response:', updatedOrCreatedOrder);
        message.success('Order created successfully');
      }

      // Verify the order details
      console.log('Final order details:', {
        id: updatedOrCreatedOrder._id,
        assignedTo: updatedOrCreatedOrder.assignedTo,
        customerName: updatedOrCreatedOrder.customerName
      });

      // Reset form and close modal
      setIsModalVisible(false);
      setCurrentOrder(null);
      orderForm.resetFields();
      
      // Ensure we fetch the latest orders
      await fetchUsers();
      await fetchOrders(); // Refresh order list
    } catch (error) {
      console.error('Full error details:', error);
      message.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Delete order
  const handleDeleteOrder = async (orderId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this order?',
      content: 'This action cannot be undone',
      onOk: async () => {
        try {
          await orderService.deleteOrder(orderId);
          message.success('Order deleted successfully');
          fetchOrders();
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
          message.error(`Failed to delete order: ${errorMessage}`);
          console.error('Order deletion error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
        }
      }
    });
  };

  // Edit order
  const handleEditOrder = (order) => {
    console.log('Editing order:', order);
    setCurrentOrder(order);
    
    // Log the assigned user
    const assignedUser = users.find(u => u._id === order.assignedTo);
    console.log('Assigned user when editing:', assignedUser);
    
    orderForm.setFieldsValue({
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      status: order.status,
      description: order.description,
      assignedTo: order.assignedTo
    });
    
    console.log('Form values set:', orderForm.getFieldsValue());
    setIsModalVisible(true);
  };

  const findAssignedUser = (assignedUserId, users) => {
    // Handle cases where assignedUserId might be an object or a string
    const userId = typeof assignedUserId === 'object' 
      ? assignedUserId._id 
      : assignedUserId;

    const stringUserId = String(userId);
    return users.find(user => String(user._id) === stringUserId);
  };

  const renderAssignedUser = (order, users) => {
    if (!order.assignedTo) return 'Unassigned';
    
    const assignedUser = findAssignedUser(order.assignedTo, users);
    
    console.log('Assigned User Debug:', {
      orderId: order._id,
      assignedToId: order.assignedTo,
      assignedUser: assignedUser,
      allUsers: users
    });

    // If assignedTo is already an object with a name, use that
    if (typeof order.assignedTo === 'object' && order.assignedTo.name) {
      return order.assignedTo.name;
    }

    return assignedUser ? assignedUser.name : 'Unknown Staff';
  };

  // Columns configuration
  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (orderNumber) => (
        <Tag color="geekblue" style={{ 
          fontFamily: 'monospace',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '13px',
          fontWeight: 500
        }}>
          {orderNumber}
        </Tag>
      )
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name) => (
        <span style={{ 
          color: 'white', 
          fontWeight: 500 
        }}>
          {name}
        </span>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <span style={{ 
          color: '#52c41a', 
          fontWeight: 600,
          background: 'rgba(82, 196, 26, 0.1)',
          padding: '4px 8px',
          borderRadius: '4px',
          display: 'inline-block'
        }}>
          ${Number(amount).toFixed(2)}
        </span>
      )
    },
    {
      title: 'Payment Status',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => {
        const statusColorMap = {
          'Paid': 'green',
          'Half-Paid': 'orange',
          'Unpaid': 'red'
        };
        return <Tag color={statusColorMap[status] || 'default'}>{status}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusColorMap = {
          'pending': 'orange',
          'processing': 'blue',
          'completed': 'green',
          'cancelled': 'red'
        };
        return <Tag color={statusColorMap[status] || 'default'}>{status}</Tag>;
      }
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (assignedTo, order) => renderAssignedUser(order, users)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Tooltip title="Edit Order">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => handleEditOrder(record)}
              disabled={user.role === 'staff'}
            />
          </Tooltip>
          <Tooltip title="Delete Order">
            <Button 
              icon={<DeleteOutlined />} 
              danger 
              onClick={() => handleDeleteOrder(record._id)}
              disabled={user.role === 'staff'}
            />
          </Tooltip>
          {user.role === 'staff' && (
            <Tooltip title="Notify Status">
              <Button 
                icon={<NotificationOutlined />} 
                onClick={() => handleNotifyStatus(record)}
              />
            </Tooltip>
          )}
        </div>
      )
    }
  ];

  const handleNotifyStatus = (order) => {
    setSelectedOrderForNotification(order);
    setIsStatusNotificationModalVisible(true);
  };

  const handleStatusNotificationSubmit = async (values) => {
    try {
      // Ensure we have the full API URL
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1';
      const fullUrl = `${apiBaseUrl}/orders/${selectedOrderForNotification._id}/notify-status`;

      console.log('Status Notification Attempt:', {
        apiBaseUrl,
        fullUrl,
        orderId: selectedOrderForNotification._id,
        status: values.status,
        message: values.message,
        token: localStorage.getItem('token') ? 'Token Present' : 'No Token'
      });

      const response = await axios.patch(
        fullUrl, 
        { 
          status: values.status, 
          message: values.message 
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update local orders state
      const updatedOrders = orders.map(order => 
        order._id === response.data.data.order._id 
          ? response.data.data.order 
          : order
      );
      setOrders(updatedOrders);

      // Close modal and reset
      setIsStatusNotificationModalVisible(false);
      setSelectedOrderForNotification(null);
      
      message.success('Order status updated successfully');
    } catch (error) {
      console.error('Full Status Notification Error:', {
        errorResponse: error.response,
        errorMessage: error.message,
        errorConfig: error.config,
        responseData: error.response?.data,
        responseStatus: error.response?.status
      });
      
      // More detailed error message
      const errorMsg = error.response?.data?.message || 
                       error.message || 
                       'Failed to update order status';
      
      message.error(errorMsg);
    }
  };

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #1A2238 0%, #121929 100%)', 
      minHeight: '100vh'
    }}>
      <Card 
        style={{ 
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          marginBottom: '24px'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              type="text"
              style={{ 
                color: 'rgba(255, 255, 255, 0.85)',
                marginRight: '12px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                height: '40px',
                width: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => navigate(-1)}
            />
            <Typography.Title 
              level={3} 
              style={{ 
                color: 'white', 
                margin: 0,
                fontWeight: 600,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              Order Management
            </Typography.Title>
          </Space>
          
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchOrders}
              style={{
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: 'white'
              }}
            >
              Refresh
            </Button>
            
            {user.role !== 'staff' && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => {
                  setCurrentOrder(null);
                  orderForm.resetFields();
                  setIsModalVisible(true);
                }}
                style={{
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}
              >
                Create Order
              </Button>
            )}
          </Space>
        </div>
        
        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '16px 0' }} />
        
        <div style={{ marginBottom: '20px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  background: 'rgba(82, 196, 26, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(82, 196, 26, 0.2)'
                }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Completed Orders</span>}
                  value={orders.filter(o => o.status === 'completed').length}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  background: 'rgba(24, 144, 255, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(24, 144, 255, 0.2)'
                }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Processing Orders</span>}
                  value={orders.filter(o => o.status === 'processing').length}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<SyncOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  background: 'rgba(250, 173, 20, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(250, 173, 20, 0.2)'
                }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Pending Orders</span>}
                  value={orders.filter(o => o.status === 'pending').length}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  background: 'rgba(255, 77, 79, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 77, 79, 0.2)'
                }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Cancelled Orders</span>}
                  value={orders.filter(o => o.status === 'cancelled').length}
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={orders} 
          rowKey="_id"
          style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            borderRadius: '12px',
            overflow: 'hidden'
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
            style: { color: 'white', marginTop: '16px' }
          }}
        />
      </Card>

      <Modal
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setCurrentOrder(null);
          orderForm.resetFields();
        }}
        footer={null}
        closeIcon={
          <div 
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '22px',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(5px)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
              e.currentTarget.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            ×
          </div>
        }
        width={600}
        centered
        className="order-modal"
        styles={{
          mask: {
            backdropFilter: 'blur(8px)',
            background: 'rgba(0,0,0,0.6)'
          },
          content: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0
          }
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, rgba(32, 41, 64, 0.95) 0%, rgba(18, 25, 41, 0.95) 100%)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(101, 126, 234, 0.08) 0%, transparent 25%), radial-gradient(circle at 85% 30%, rgba(118, 75, 162, 0.08) 0%, transparent 25%)',
            pointerEvents: 'none',
          }}></div>
          <div style={{
            padding: '32px 35px 35px',
          }}>
            <h2 style={{
              color: 'white',
              fontSize: '26px',
              fontWeight: '600',
              marginBottom: '25px',
              textAlign: 'center',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {currentOrder ? 'Edit Order' : 'Create New Order'}
            </h2>
            
            <Form
              form={orderForm}
              layout="vertical"
              onFinish={handleCreateOrder}
              initialValues={currentOrder || {}}
              style={{
                background: 'transparent',
              }}
            >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customerName"
                label={
                  <div style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 500,
                    marginBottom: '8px'
                  }}>
                    Customer Name
                  </div>
                }
                rules={[{ required: true, message: 'Please enter customer name' }]}
              >
                <Input 
                  placeholder="Enter customer name"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    height: '42px',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="totalAmount"
                label={
                  <div style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 500,
                    marginBottom: '8px'
                  }}>
                    Total Amount
                  </div>
                }
                rules={[
                  { required: true, message: 'Please enter total amount' },
                  { type: 'number', min: 0, message: 'Amount must be non-negative', transform: (value) => Number(value) }
                ]}
              >
                <Input 
                  prefix="$"
                  placeholder="Enter total amount"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    height: '42px',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="paymentStatus"
                label={
                  <div style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 500,
                    marginBottom: '8px'
                  }}>
                    Payment Status
                  </div>
                }
                rules={[{ required: true, message: 'Please select payment status' }]}
              >
                <Select 
                  placeholder="Select Payment Status"
                  style={{
                    width: '100%',
                    height: '42px'
                  }}
                  dropdownStyle={{
                    background: '#1A2238',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Select.Option value="Paid">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#52c41a', marginRight: '8px' }}></div>
                      Paid
                    </div>
                  </Select.Option>
                  <Select.Option value="Half-Paid">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#faad14', marginRight: '8px' }}></div>
                      Half-Paid
                    </div>
                  </Select.Option>
                  <Select.Option value="Unpaid">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff4d4f', marginRight: '8px' }}></div>
                      Unpaid
                    </div>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label={
                  <div style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 500,
                    marginBottom: '8px'
                  }}>
                    Status
                  </div>
                }
                rules={[{ required: true, message: 'Please select order status' }]}
              >
                <Select 
                  placeholder="Select order status" 
                  style={{
                    width: '100%',
                    height: '42px'
                  }}
                  dropdownStyle={{
                    background: '#1A2238',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Select.Option value="pending">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#faad14', marginRight: '8px' }}></div>
                      Pending
                    </div>
                  </Select.Option>
                  <Select.Option value="processing">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1890ff', marginRight: '8px' }}></div>
                      Processing
                    </div>
                  </Select.Option>
                  <Select.Option value="completed">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#52c41a', marginRight: '8px' }}></div>
                      Completed
                    </div>
                  </Select.Option>
                  <Select.Option value="cancelled">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f5222d', marginRight: '8px' }}></div>
                      Cancelled
                    </div>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="assignedTo"
            label={
              <div style={{
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 500,
                marginBottom: '8px'
              }}>
                Assigned To
              </div>
            }
            rules={[
              { 
                required: true, 
                message: 'Please select a staff member',
                validator: async (_, value) => {
                  const staffUsers = users.filter(u => u.role === 'staff');
                  if (!value && staffUsers.length === 0) {
                    throw new Error('No staff members available');
                  }
                }
              }
            ]}
          >
            <Select 
              placeholder="Select staff member"
              style={{
                width: '100%',
                height: '42px'
              }}
              dropdownStyle={{
                background: '#1A2238',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {users
                .filter(u => u.role === 'staff')
                .map(user => {
                  console.log('Staff option:', user);
                  return (
                    <Select.Option key={user._id} value={user._id}>
                      {user.name || user.username}
                    </Select.Option>
                  );
                })
              }
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <div style={{
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 500,
                marginBottom: '8px'
              }}>
                Description
              </div>
            }
          >
            <Input.TextArea 
              placeholder="Optional order description"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                minHeight: '80px',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
              style={{ 
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
                border: 'none',
                height: '48px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                marginTop: '20px',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="submit-button"
              loading={loading}
              onMouseEnter={(e) => {
                const button = e.currentTarget;
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 12px 25px rgba(102, 126, 234, 0.6)';
              }}
              onMouseLeave={(e) => {
                const button = e.currentTarget;
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
              }}
            >
              {currentOrder ? 'Update Order' : 'Create Order'}
            </Button>
          </Form.Item>
        </Form>
          </div>
        </div>
      </Modal>

      {isStatusNotificationModalVisible && (
        <Modal
          open={isStatusNotificationModalVisible}
          onCancel={() => setIsStatusNotificationModalVisible(false)}
          footer={null}
          width={500}
          centered
          closeIcon={
            <div 
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '22px',
                transition: 'all 0.3s ease',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(5px)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              ×
            </div>
          }
          styles={{
            mask: {
              backdropFilter: 'blur(8px)',
              background: 'rgba(0,0,0,0.6)'
            },
            content: {
              background: 'transparent',
              boxShadow: 'none',
              padding: 0
            }
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, rgba(32, 41, 64, 0.95) 0%, rgba(18, 25, 41, 0.95) 100%)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            padding: '32px'
          }}>
            <Typography.Title level={3} style={{ color: 'white', marginBottom: '24px', textAlign: 'center' }}>
              Notify Order Status
            </Typography.Title>
          <Form
            layout="vertical"
            onFinish={handleStatusNotificationSubmit}
          >
            <Form.Item
              name="status"
              label={<span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Order Status</span>}
              rules={[{ required: true, message: 'Please select a status' }]}
            >
              <Select
                style={{
                  width: '100%',
                  height: '42px'
                }}
                dropdownStyle={{
                  background: '#1A2238',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <Select.Option value="pending">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#faad14', marginRight: '8px' }}></div>
                    Pending
                  </div>
                </Select.Option>
                <Select.Option value="processing">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1890ff', marginRight: '8px' }}></div>
                    Processing
                  </div>
                </Select.Option>
                <Select.Option value="completed">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#52c41a', marginRight: '8px' }}></div>
                    Completed
                  </div>
                </Select.Option>
                <Select.Option value="cancelled">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff4d4f', marginRight: '8px' }}></div>
                    Cancelled
                  </div>
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="message"
              label={<span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Notification Details</span>}
              rules={[{ required: true, message: 'Please provide a status update message' }]}
            >
              <Input.TextArea 
                rows={4} 
                placeholder="Enter details about this status change..."
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  borderRadius: '8px',
                  padding: '12px',
                  transition: 'all 0.3s ease'
                }}
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block
                style={{ 
                  height: '48px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 500,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
              >
                Notify Manager
              </Button>
            </Form.Item>
            </Form>
          </div>
        </Modal>
      )}

      <style jsx global>{`
        .order-modal .ant-modal-content {
          background: transparent;
          box-shadow: none;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .order-modal .ant-select-selector {
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border-radius: 8px !important;
          height: 42px !important;
          padding: 0 11px !important;
          transition: all 0.3s ease !important;
        }
        
        .order-modal .ant-select:hover .ant-select-selector {
          border-color: rgba(102, 126, 234, 0.5) !important;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1) !important;
        }
        
        .order-modal .ant-select-focused .ant-select-selector {
          border-color: rgba(102, 126, 234, 0.8) !important;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) !important;
        }
        
        .order-modal .ant-select-selection-placeholder,
        .order-modal .ant-select-selection-item {
          line-height: 40px !important;
          color: rgba(255, 255, 255, 0.85) !important;
        }
        
        .order-modal .ant-select-arrow {
          color: rgba(255, 255, 255, 0.5) !important;
        }
        
        .order-modal .ant-input {
          transition: all 0.3s ease !important;
        }
        
        .order-modal .ant-input:hover {
          border-color: rgba(102, 126, 234, 0.5) !important;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1) !important;
        }
        
        .order-modal .ant-input:focus {
          border-color: rgba(102, 126, 234, 0.8) !important;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) !important;
        }
        
        .order-modal .ant-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
        
        .order-modal .ant-input-number {
          transition: all 0.3s ease !important;
        }
        
        .order-modal .ant-input-number:hover {
          border-color: rgba(102, 126, 234, 0.5) !important;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1) !important;
        }
        
        .order-modal .ant-input-number:focus {
          border-color: rgba(102, 126, 234, 0.8) !important;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) !important;
        }
        
        .order-modal .ant-input-number-input {
          background: transparent !important;
          color: white !important;
        }
        
        .order-modal .ant-form-item-explain-error {
          color: #ff7875;
          font-size: 12px;
          margin-top: 4px;
          text-shadow: 0 0 8px rgba(255, 0, 0, 0.2);
        }
        
        .order-modal .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }
        
        .order-modal .ant-select-dropdown {
          background: rgba(26, 34, 56, 0.95) !important;
          backdrop-filter: blur(10px) !important;
          border-radius: 8px !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
          padding: 8px 0 !important;
        }
        
        .order-modal .ant-select-item {
          color: rgba(255, 255, 255, 0.85) !important;
          transition: all 0.2s ease !important;
          border-radius: 4px !important;
          margin: 0 4px !important;
          padding: 8px 12px !important;
        }
        
        .order-modal .ant-select-item-option-active {
          background: rgba(102, 126, 234, 0.15) !important;
        }
        
        .order-modal .ant-select-item-option-selected {
          background: rgba(102, 126, 234, 0.25) !important;
          font-weight: 500 !important;
        }
      `}</style>
    </div>
  );
};

export default OrderManagement;
