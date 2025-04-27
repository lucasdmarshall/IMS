import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layout, 
  Typography, 
  Table, 
  Card, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message,
  Space,
  Tag
} from 'antd';
import { 
  EditOutlined, 
  PlusOutlined, 
  TransactionOutlined,
  ArrowLeftOutlined  
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';  

import { productService } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const AdminStockManagement = () => {
  const navigate = useNavigate();  
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustStockModalVisible, setAdjustStockModalVisible] = useState(false);
  const [transferStockModalVisible, setTransferStockModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [stockAdjustForm] = Form.useForm();
  const [stockTransferForm] = Form.useForm();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const fetchedProducts = await productService.getAllProducts();
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
    } catch (error) {
      message.error('Unable to load products. Please try again.');
      console.error('Product fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdjustStock = async (values) => {
    try {
      const adjustmentType = values.adjustmentType;
      const adjustmentQuantity = parseInt(values.adjustmentQuantity, 10);

      let newStock;
      if (adjustmentType === 'add') {
        newStock = currentProduct.stock + adjustmentQuantity;
      } else if (adjustmentType === 'remove') {
        newStock = currentProduct.stock - adjustmentQuantity;
        if (newStock < 0) {
          message.error('Cannot reduce stock below zero');
          return;
        }
      }

      await productService.updateProduct(currentProduct._id, { 
        stock: newStock,
        stockAdjustmentReason: values.reason || 'Manual Adjustment'
      });

      message.success(`Stock ${adjustmentType === 'add' ? 'added' : 'removed'} successfully`);
      fetchProducts();
      setAdjustStockModalVisible(false);
      stockAdjustForm.resetFields();
    } catch (error) {
      message.error('Failed to adjust stock');
      console.error('Stock adjustment error:', error);
    }
  };

  const handleTransferStock = async (values) => {
    try {
      const sourceProduct = currentProduct;
      const transferQuantity = parseInt(values.transferQuantity, 10);

      // Validate source product stock
      if (sourceProduct.stock < transferQuantity) {
        message.error('Insufficient stock for transfer');
        return;
      }

      // Find destination product
      const destinationProduct = products.find(p => p._id === values.destinationProductId);
      
      if (!destinationProduct) {
        message.error('Destination product not found');
        return;
      }

      // Update source product stock
      await productService.updateProduct(sourceProduct._id, { 
        stock: sourceProduct.stock - transferQuantity,
        stockTransferReason: `Transfer to ${destinationProduct.name}`
      });

      // Update destination product stock
      await productService.updateProduct(destinationProduct._id, { 
        stock: destinationProduct.stock + transferQuantity,
        stockTransferReason: `Transfer from ${sourceProduct.name}`
      });

      message.success('Stock transferred successfully');
      fetchProducts();
      setTransferStockModalVisible(false);
      stockTransferForm.resetFields();
    } catch (error) {
      message.error('Failed to transfer stock');
      console.error('Stock transfer error:', error);
    }
  };

  const columns = [
    {
      title: 'No.',
      dataIndex: 'index',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 70,
      align: 'center'
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => (
        <Tag 
          color={
            text === 'Electronics' ? 'blue' : 
            text === 'Clothing' ? 'green' : 
            text === 'Food' ? 'red' : 
            text === 'Books' ? 'purple' : 'orange'
          }
        >
          {text}
        </Tag>
      )
    },
    {
      title: 'Current Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (text) => (
        <Text 
          strong 
          style={{ 
            color: text > 10 ? '#52c41a' : '#ff7875' 
          }}
        >
          {text}
        </Text>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<PlusOutlined />} 
            onClick={() => {
              setCurrentProduct(record);
              setAdjustStockModalVisible(true);
            }}
          >
            Adjust
          </Button>
          <Button 
            icon={<TransactionOutlined />} 
            onClick={() => {
              setCurrentProduct(record);
              setTransferStockModalVisible(true);
            }}
          >
            Transfer
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Layout 
      style={{ 
        padding: '24px', 
        background: '#1A2238',  
        minHeight: '100vh'
      }}
    >
      <Card 
        style={{ 
          borderRadius: 12, 
          background: 'rgba(26, 34, 56, 0.9)', 
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: 24 
        }}>
          <Button 
            type="text"
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}  
            style={{ 
              marginRight: 16, 
              color: 'rgba(255,255,255,0.7)', 
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.3s ease',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            className="hover:bg-white/10 hover:text-white"
          >
            <span style={{ marginLeft: 8 }}>Back</span>
          </Button>
          <Title 
            level={3} 
            style={{ 
              color: 'rgba(255,255,255,0.85)', 
              margin: 0 
            }}
          >
            Stock Management
          </Title>
        </div>
        <Table 
          columns={columns}
          dataSource={filteredProducts}
          rowKey="_id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} products`
          }}
          style={{ 
            background: 'transparent', 
            borderRadius: 8 
          }}
          rowClassName={(record, index) => 
            index % 2 === 0 ? 'dark-table-row-light' : 'dark-table-row-dark'
          }
        />
      </Card>

      {/* Adjust Stock Modal */}
      <Modal
        title="Adjust Stock"
        visible={adjustStockModalVisible}
        onCancel={() => {
          setAdjustStockModalVisible(false);
          stockAdjustForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={stockAdjustForm}
          layout="vertical"
          onFinish={handleAdjustStock}
          initialValues={{ adjustmentType: 'add' }}
        >
          <Form.Item 
            name="adjustmentType" 
            label="Adjustment Type"
            rules={[{ required: true, message: 'Please select adjustment type' }]}
          >
            <Select>
              <Select.Option value="add">Add Stock</Select.Option>
              <Select.Option value="remove">Remove Stock</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item 
            name="adjustmentQuantity" 
            label="Quantity"
            rules={[
              { required: true, message: 'Please enter quantity' },
              { 
                validator: (_, value) => 
                  value > 0 ? Promise.resolve() : Promise.reject('Quantity must be positive')
              }
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item 
            name="reason" 
            label="Reason (Optional)"
          >
            <Input.TextArea rows={3} placeholder="Enter reason for stock adjustment" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Adjust Stock
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Transfer Stock Modal */}
      <Modal
        title="Transfer Stock"
        visible={transferStockModalVisible}
        onCancel={() => {
          setTransferStockModalVisible(false);
          stockTransferForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={stockTransferForm}
          layout="vertical"
          onFinish={handleTransferStock}
        >
          <Form.Item 
            name="destinationProductId" 
            label="Destination Product"
            rules={[{ required: true, message: 'Please select destination product' }]}
          >
            <Select 
              placeholder="Select product to transfer stock to"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {products
                .filter(p => p._id !== currentProduct?._id)
                .map(product => (
                  <Select.Option key={product._id} value={product._id}>
                    {product.name} (Current Stock: {product.stock})
                  </Select.Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item 
            name="transferQuantity" 
            label="Transfer Quantity"
            rules={[
              { required: true, message: 'Please enter transfer quantity' },
              { 
                validator: (_, value) => {
                  const quantity = parseInt(value, 10);
                  return quantity > 0 && quantity <= currentProduct?.stock 
                    ? Promise.resolve() 
                    : Promise.reject('Invalid transfer quantity')
                }
              }
            ]}
          >
            <Input 
              type="number" 
              max={currentProduct?.stock} 
              placeholder={`Max: ${currentProduct?.stock}`} 
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Transfer Stock
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminStockManagement;
