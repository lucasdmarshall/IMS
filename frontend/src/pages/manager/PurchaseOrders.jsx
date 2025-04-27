import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  message, 
  Card, 
  Row, 
  Col, 
  Statistic,
  Tag, 
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const { Option } = Select;

const PurchaseOrders = () => {
  const { t } = useTranslation();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSupplierModalVisible, setIsSupplierModalVisible] = useState(false);
  const [currentPurchaseOrder, setCurrentPurchaseOrder] = useState(null);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [purchaseOrderForm] = Form.useForm();
  const [supplierForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Fetch Purchase Orders
  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/purchase-orders', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      setPurchaseOrders(response.data.data);
    } catch (error) {
      message.error(t('errors.server_error'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch Suppliers
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/suppliers', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      setSuppliers(response.data.data);
    } catch (error) {
      message.error(t('errors.server_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
    fetchSuppliers();
  }, []);

  // Handle Create/Update Purchase Order
  const handleCreatePurchaseOrder = async (values) => {
    try {
      setLoading(true);
      const url = currentPurchaseOrder 
        ? `/api/purchase-orders/${currentPurchaseOrder._id}` 
        : '/api/purchase-orders';
      
      const method = currentPurchaseOrder ? 'put' : 'post';
      
      const response = await axios[method](url, values, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });

      message.success(
        currentPurchaseOrder 
          ? t('order_management.purchase_orders.notifications.order_updated')
          : t('order_management.purchase_orders.notifications.order_created')
      );

      fetchPurchaseOrders();
      setIsModalVisible(false);
      purchaseOrderForm.resetFields();
    } catch (error) {
      message.error(t('errors.server_error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Create/Update Supplier
  const handleCreateSupplier = async (values) => {
    try {
      setLoading(true);
      const url = currentSupplier 
        ? `/api/suppliers/${currentSupplier._id}` 
        : '/api/suppliers';
      
      const method = currentSupplier ? 'put' : 'post';
      
      const response = await axios[method](url, values, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });

      message.success(
        currentSupplier 
          ? 'Supplier updated successfully' 
          : 'Supplier created successfully'
      );

      fetchSuppliers();
      setIsSupplierModalVisible(false);
      supplierForm.resetFields();
    } catch (error) {
      message.error(t('errors.server_error'));
    } finally {
      setLoading(false);
    }
  };

  // Purchase Order Columns
  const purchaseOrderColumns = [
    {
      title: t('order_management.purchase_orders.form.supplier'),
      dataIndex: 'supplier',
      key: 'supplier',
      render: (supplierId) => {
        const supplier = suppliers.find(s => s._id === supplierId);
        return supplier ? supplier.name : 'Unknown'
      }
    },
    {
      title: t('order_management.purchase_orders.form.total_amount'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `$${amount.toFixed(2)}`
    },
    {
      title: t('order_management.purchase_orders.form.order_date'),
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: t('order_management.purchase_orders.form.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusColors = {
          pending: 'orange',
          approved: 'blue',
          completed: 'green',
          cancelled: 'red'
        };
        return (
          <Tag color={statusColors[status]}>
            {t(`order_management.purchase_orders.status.${status}`)}
          </Tag>
        );
      }
    },
    {
      title: t('actions.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title={t('actions.edit')}>
            <Button 
              icon={<EditOutlined />} 
              onClick={() => {
                setCurrentPurchaseOrder(record);
                purchaseOrderForm.setFieldsValue(record);
                setIsModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title={t('actions.delete')}>
            <Button 
              icon={<DeleteOutlined />} 
              danger 
              onClick={() => handleDeletePurchaseOrder(record._id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Supplier Columns
  const supplierColumns = [
    {
      title: t('order_management.purchase_orders.supplier_form.name'),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: t('order_management.purchase_orders.supplier_form.contact_person'),
      dataIndex: 'contactPerson',
      key: 'contactPerson'
    },
    {
      title: t('order_management.purchase_orders.supplier_form.email'),
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: t('actions.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title={t('actions.edit')}>
            <Button 
              icon={<EditOutlined />} 
              onClick={() => {
                setCurrentSupplier(record);
                supplierForm.setFieldsValue(record);
                setIsSupplierModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title={t('actions.delete')}>
            <Button 
              icon={<DeleteOutlined />} 
              danger 
              onClick={() => handleDeleteSupplier(record._id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Delete Purchase Order
  const handleDeletePurchaseOrder = async (id) => {
    try {
      await axios.delete(`/api/purchase-orders/${id}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      message.success(t('order_management.purchase_orders.notifications.order_deleted'));
      fetchPurchaseOrders();
    } catch (error) {
      message.error(t('errors.server_error'));
    }
  };

  // Delete Supplier
  const handleDeleteSupplier = async (id) => {
    try {
      await axios.delete(`/api/suppliers/${id}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      message.success('Supplier deleted successfully');
      fetchSuppliers();
    } catch (error) {
      message.error(t('errors.server_error'));
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
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
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
                value={purchaseOrders.filter(o => o.status === 'completed').length}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
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
                value={purchaseOrders.filter(o => o.status === 'pending').length}
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
                value={purchaseOrders.filter(o => o.status === 'cancelled').length}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<StopOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Space style={{ marginBottom: '20px', width: '100%', justifyContent: 'space-between' }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setCurrentPurchaseOrder(null);
              purchaseOrderForm.resetFields();
              setIsModalVisible(true);
            }}
          >
            {t('order_management.purchase_orders.create_purchase_order')}
          </Button>
          <Button 
            type="default" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setCurrentSupplier(null);
              supplierForm.resetFields();
              setIsSupplierModalVisible(true);
            }}
          >
            {t('order_management.purchase_orders.manage_suppliers')}
          </Button>
        </Space>

        <Table 
          columns={purchaseOrderColumns}
          dataSource={purchaseOrders}
          loading={loading}
          rowKey="_id"
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} purchase orders`,
            style: { color: 'white', marginTop: '16px' }
          }}
        />
      </Card>

      {/* Purchase Order Modal */}
      <Modal
        title={currentPurchaseOrder 
          ? t('order_management.purchase_orders.update_order') 
          : t('order_management.purchase_orders.create_purchase_order')
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setCurrentPurchaseOrder(null);
          purchaseOrderForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={purchaseOrderForm}
          layout="vertical"
          onFinish={handleCreatePurchaseOrder}
        >
          <Form.Item
            name="supplier"
            label={t('order_management.purchase_orders.form.supplier')}
            rules={[{ required: true, message: 'Please select a supplier' }]}
          >
            <Select placeholder="Select Supplier">
              {suppliers.map(supplier => (
                <Option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="totalAmount"
            label={t('order_management.purchase_orders.form.total_amount')}
            rules={[{ required: true, message: 'Please input total amount' }]}
          >
            <Input type="number" prefix="$" />
          </Form.Item>

          <Form.Item
            name="orderDate"
            label={t('order_management.purchase_orders.form.order_date')}
            rules={[{ required: true, message: 'Please select order date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="expectedDeliveryDate"
            label={t('order_management.purchase_orders.form.expected_delivery_date')}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label={t('order_management.purchase_orders.form.status')}
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              {['pending', 'approved', 'completed', 'cancelled'].map(status => (
                <Option key={status} value={status}>
                  {t(`order_management.purchase_orders.status.${status}`)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label={t('order_management.purchase_orders.form.notes')}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)',
                border: 'none'
              }}
            >
              {currentPurchaseOrder 
                ? t('actions.update') 
                : t('actions.create')
              }
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Supplier Modal */}
      <Modal
        title={currentSupplier 
          ? 'Update Supplier' 
          : 'Create Supplier'
        }
        open={isSupplierModalVisible}
        onCancel={() => {
          setIsSupplierModalVisible(false);
          setCurrentSupplier(null);
          supplierForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={supplierForm}
          layout="vertical"
          onFinish={handleCreateSupplier}
        >
          <Form.Item
            name="name"
            label={t('order_management.purchase_orders.supplier_form.name')}
            rules={[{ required: true, message: 'Please input supplier name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="contactPerson"
            label={t('order_management.purchase_orders.supplier_form.contact_person')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label={t('order_management.purchase_orders.supplier_form.email')}
            rules={[
              { required: true, message: 'Please input email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input type="email" />
          </Form.Item>

          <Form.Item
            name="phone"
            label={t('order_management.purchase_orders.supplier_form.phone')}
          >
            <Input type="tel" />
          </Form.Item>

          <Form.Item
            name="address"
            label={t('order_management.purchase_orders.supplier_form.address')}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="taxId"
            label={t('order_management.purchase_orders.supplier_form.tax_id')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="paymentTerms"
            label={t('order_management.purchase_orders.supplier_form.payment_terms')}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)',
                border: 'none'
              }}
            >
              {currentSupplier ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PurchaseOrders;
