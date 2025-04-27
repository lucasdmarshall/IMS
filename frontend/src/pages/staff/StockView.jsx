import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Typography, 
  Table, 
  Card, 
  Tag,
  Button
} from 'antd';
import { 
  ArrowLeftOutlined  // Import back button icon
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

import { productService } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const StaffStockView = () => {
  const navigate = useNavigate();  // Initialize navigate function
  useAuth(); // Keep authentication context
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const fetchedProducts = await productService.getAllProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Product fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
            Stock Levels
          </Title>
        </div>
        <Table 
          columns={columns}
          dataSource={products}
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
    </Layout>
  );
};

export default StaffStockView;
