import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layout, 
  Typography, 
  Input, 
  Select, 
  Table, 
  Tag, 
  Space, 
  Dropdown, 
  Menu, 
  message, 
  Modal, 
  Form, 
  Button,
  Tooltip,
  Card,
  Row,
  Col,
  Statistic,
  Divider
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  EditOutlined, 
  MoreOutlined,
  DatabaseOutlined,
  EyeOutlined,
  PlusOutlined,
  DashboardOutlined,
  BoxPlotOutlined,
  TagsOutlined,
  ArrowLeftOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { productService } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const INITIAL_CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Books', 'Other'];

const ManagerProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();

  const categories = useMemo(() => INITIAL_CATEGORIES, []);

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

  // Calculate product statistics
  const productStats = useMemo(() => {
    const totalProducts = filteredProducts.length;
    const totalStock = filteredProducts.reduce((sum, product) => sum + product.stock, 0);
    const totalValue = filteredProducts.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const categoryCounts = filteredProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    return {
      totalProducts,
      totalStock,
      totalValue,
      categoryCounts
    };
  }, [filteredProducts]);

  const handleSearch = (value) => {
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(value.toLowerCase()) ||
      product.description.toLowerCase().includes(value.toLowerCase())
    );
    setSearchTerm(value);
    setFilteredProducts(filtered);
  };

  const handleCategoryFilter = (category) => {
    const filtered = category 
      ? products.filter(product => product.category === category)
      : products;
    setCategoryFilter(category);
    setFilteredProducts(filtered);
  };

  const handleCreateProduct = async (values) => {
    try {
      const productData = {
        name: values.name.trim(),
        description: values.description.trim(),
        price: parseFloat(values.price),
        category: values.category,
        stock: parseInt(values.stock, 10)
      };

      // Validate inputs
      if (productData.name.length > 100) {
        message.error('Product name cannot exceed 100 characters');
        return;
      }

      // Check for existing product
      const existingProducts = await productService.getAllProducts();
      const isDuplicate = existingProducts.some(
        product => product.name.toLowerCase() === productData.name.toLowerCase()
      );

      if (isDuplicate) {
        message.error(`A product with the name "${productData.name}" already exists`);
        return;
      }

      const newProduct = await productService.createProduct(productData);
      message.success('Product created successfully');
      fetchProducts();
      setAddModalVisible(false);
      addForm.resetFields();
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Failed to create product';
      
      // Specific error messages
      if (errorMessage.includes('duplicate key')) {
        message.error('A product with this name already exists');
      } else if (errorMessage.includes('validation failed')) {
        message.error('Product data is invalid. Please check your inputs.');
      } else {
        message.error(errorMessage);
      }
      
      console.error('Product creation error:', error);
    }
  };

  const handleUpdateProduct = async (values) => {
    try {
      // Validate category
      if (!INITIAL_CATEGORIES.includes(values.category)) {
        message.error('Invalid category. Please select from: Electronics, Clothing, Food, Books, Other');
        return;
      }

      const productData = {
        name: values.name.trim(),
        description: values.description.trim(),
        price: parseFloat(values.price),
        category: values.category,
        stock: parseInt(values.stock, 10)
      };

      await productService.updateProduct(currentProduct._id, productData);
      message.success('Product updated successfully');
      fetchProducts();
      setEditModalVisible(false);
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Failed to update product';
      
      // Specific error messages
      if (errorMessage.includes('validation failed')) {
        message.error('Product data is invalid. Please check your inputs, especially the category.');
      } else {
        message.error(errorMessage);
      }
      
      console.error('Product update error:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this product?',
      content: 'This action cannot be undone',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No, Cancel',
      onOk: async () => {
        try {
          await productService.deleteProduct(productId);
          message.success('Product deleted successfully');
          fetchProducts();
        } catch (error) {
          message.error('Failed to delete product');
        }
      }
    });
  };

  const columns = [
    {
      title: 'No.',
      dataIndex: 'index',
      key: 'index',
      width: 70,
      render: (text, record, index) => (
        <Text 
          style={{ 
            fontWeight: 'bold', 
            color: '#595959',
            background: '#f0f0f0',
            padding: '4px 8px',
            borderRadius: 4
          }}
        >
          {index + 1}
        </Text>
      ),
      sorter: (a, b, sortOrder) => {
        return sortOrder === 'ascend' ? a.index - b.index : b.index - a.index;
      }
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Text 
          style={{ 
            color: '#1890ff', 
            cursor: 'pointer'
          }}
          onClick={() => {
            setCurrentProduct(record);
            setViewModalVisible(true);
          }}
        >
          {text}
        </Text>
      ),
      sorter: (a, b, sortOrder) => {
        return sortOrder === 'ascend' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <Text 
          style={{ 
            color: '#595959'
          }}
          ellipsis={{
            rows: 2,
            expandable: false,
            symbol: 'more'
          }}
        >
          {text}
        </Text>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (text) => (
        <Text 
          style={{ 
            color: '#1890ff'
          }}
        >
          ${text.toFixed(2)}
        </Text>
      ),
      sorter: (a, b, sortOrder) => {
        return sortOrder === 'ascend' ? a.price - b.price : b.price - a.price;
      }
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => (
        <Tag 
          color={text === 'Electronics' ? 'blue' : text === 'Clothing' ? 'green' : text === 'Food' ? 'red' : text === 'Books' ? 'purple' : 'orange'}
        >
          {text}
        </Tag>
      ),
      sorter: (a, b, sortOrder) => {
        return sortOrder === 'ascend' ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category);
      }
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (text) => (
        <Text 
          style={{ 
            color: text > 10 ? '#52c41a' : '#ff7875'
          }}
        >
          {text}
        </Text>
      ),
      sorter: (a, b, sortOrder) => {
        return sortOrder === 'ascend' ? a.stock - b.stock : b.stock - a.stock;
      }
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: (text, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => {
              setCurrentProduct(record);
              form.setFieldsValue(record);
              setEditModalVisible(true);
            }}
          />
          <Button 
            type="link" 
            icon={<MoreOutlined />} 
            onClick={() => {
              setCurrentProduct(record);
              setViewModalVisible(true);
            }}
          />
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteProduct(record._id)}
          />
        </Space>
      )
    }
  ];

  return (
    <Layout 
      style={{ 
        minHeight: '100vh', 
        background: '#141414', 
        padding: 24,
        color: '#ffffff' 
      }}
    >
      {/* Back Button Row */}
      <Row 
        align="middle" 
        style={{ 
          marginBottom: 24, 
          background: 'rgba(255,255,255,0.05)', 
          padding: '12px 24px', 
          borderRadius: 12, 
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Col>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}  
            style={{ 
              fontSize: 16, 
              color: '#1890ff', 
              display: 'flex', 
              alignItems: 'center' 
            }}
          >
            Back to Dashboard
          </Button>
        </Col>
      </Row>

      {/* Product Statistics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card 
            hoverable 
            style={{ 
              borderRadius: 12, 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Statistic 
              title={<span style={{color: 'rgba(255,255,255,0.85)'}}>Total Products</span>} 
              value={productStats.totalProducts} 
              prefix={<DatabaseOutlined style={{color: '#1890ff'}} />} 
              valueStyle={{ color: '#1890ff' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card 
            hoverable 
            style={{ 
              borderRadius: 12, 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Statistic 
              title={<span style={{color: 'rgba(255,255,255,0.85)'}}>Total Stock</span>} 
              value={productStats.totalStock} 
              prefix={<BoxPlotOutlined style={{color: '#1890ff'}} />} 
              valueStyle={{ color: '#1890ff' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card 
            hoverable 
            style={{ 
              borderRadius: 12, 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Statistic 
              title={<span style={{color: 'rgba(255,255,255,0.85)'}}>Total Inventory Value</span>} 
              value={productStats.totalValue.toFixed(2)} 
              prefix="$" 
              prefix={<TagsOutlined style={{color: '#1890ff'}} />} 
              valueStyle={{ color: '#1890ff' }} 
            />
          </Card>
        </Col>
      </Row>

      {/* Header with Search and Filters */}
      <Card 
        style={{ 
          marginBottom: 24, 
          borderRadius: 12, 
          background: 'rgba(255,255,255,0.05)', 
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Title 
              level={3} 
              style={{ 
                margin: 0, 
                color: '#1890ff', 
                display: 'flex', 
                alignItems: 'center' 
              }}
            >
              <DatabaseOutlined style={{ marginRight: 12, color: '#1890ff' }} />
              Product Inventory
            </Title>
            <Paragraph 
              style={{ 
                marginTop: 8, 
                color: 'rgba(255,255,255,0.65)' 
              }}
            >
              Manage and track your product inventory
            </Paragraph>
          </Col>
          <Col>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => {
                  setCurrentProduct(null);
                  addForm.resetFields();
                  setAddModalVisible(true);
                }}
                style={{ 
                  background: '#52c41a', 
                  borderColor: '#52c41a',
                  borderRadius: 8 
                }}
              >
                Add New Product
              </Button>
              <Search
                placeholder="Search products..."
                onSearch={handleSearch}
                style={{ width: 250 }}
                prefix={<SearchOutlined />}
              />
              <Select
                style={{ width: 200 }}
                placeholder="Filter Category"
                allowClear
                onChange={handleCategoryFilter}
                suffixIcon={<FilterOutlined />}
              >
                {categories.map(category => (
                  <Select.Option key={category} value={category}>
                    {category}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Product Table */}
      <Card 
        style={{ 
          borderRadius: 12, 
          background: 'rgba(255,255,255,0.05)', 
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
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

      {/* Modals for Add, Edit, View */}
      <Modal
        title="Add New Product"
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleCreateProduct}
        >
          <Form.Item 
            name="name" 
            label="Product Name" 
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            name="description" 
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item 
            name="price" 
            label="Price" 
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <Input type="number" prefix="$" />
          </Form.Item>
          <Form.Item 
            name="category" 
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select>
              {categories.map(category => (
                <Select.Option key={category} value={category}>
                  {category}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item 
            name="stock" 
            label="Stock" 
            rules={[{ required: true, message: 'Please enter stock quantity' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add Product
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Product"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProduct}
        >
          <Form.Item 
            name="name" 
            label="Product Name" 
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            name="description" 
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item 
            name="price" 
            label="Price" 
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <Input type="number" prefix="$" />
          </Form.Item>
          <Form.Item 
            name="category" 
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select>
              {categories.map(category => (
                <Select.Option key={category} value={category}>
                  {category}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item 
            name="stock" 
            label="Stock" 
            rules={[{ required: true, message: 'Please enter stock quantity' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Update Product
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="View Product"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
      >
        <div>
          <Text strong>Product Name:</Text> {currentProduct?.name}
        </div>
        <div>
          <Text strong>Description:</Text> {currentProduct?.description}
        </div>
        <div>
          <Text strong>Price:</Text> ${currentProduct?.price.toFixed(2)}
        </div>
        <div>
          <Text strong>Category:</Text> {currentProduct?.category}
        </div>
        <div>
          <Text strong>Stock:</Text> {currentProduct?.stock}
        </div>
      </Modal>
    </Layout>
  );
};

export default ManagerProducts;
