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
  message, 
  Modal, 
  Form, 
  Button,
  Tooltip,
  Card,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  EditOutlined, 
  MoreOutlined,
  DatabaseOutlined,
  EyeOutlined,
  PlusOutlined,
  BoxPlotOutlined,
  TagsOutlined,
  ArrowLeftOutlined  
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';  

import { productService } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const INITIAL_CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Books', 'Other'];

const StaffProducts = () => {
  const navigate = useNavigate();  
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

  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    form.setFieldsValue(product);
    setEditModalVisible(true);
  };

  const handleViewProduct = (product) => {
    setCurrentProduct(product);
    setViewModalVisible(true);
  };

  const onUpdateProduct = async (values) => {
    if (!currentProduct) {
      message.error('No product selected for update');
      return;
    }
    try {
      await productService.updateProduct(currentProduct._id, values);
      message.success('Product updated successfully');
      fetchProducts();
      setEditModalVisible(false);
    } catch (error) {
      message.error('Failed to update product');
      console.error('Product update error:', error.response?.data || error.message);
    }
  };

  const onCreateProduct = async (values) => {
    try {
      // Ensure all required fields are present and valid
      const productData = {
        name: values.name.trim(), // Trim whitespace
        description: values.description.trim(),
        price: parseFloat(values.price),
        category: values.category,
        stock: parseInt(values.stock, 10)
      };

      // Additional validation
      if (productData.name.length > 100) {
        message.error('Product name cannot exceed 100 characters');
        return;
      }

      // Check for existing product with the same name
      const existingProducts = await productService.getAllProducts();
      const isDuplicate = existingProducts.some(
        product => product.name.toLowerCase() === productData.name.toLowerCase()
      );

      if (isDuplicate) {
        message.error(`A product with the name "${productData.name}" already exists`);
        return;
      }

      // Validate numeric fields
      if (isNaN(productData.price) || isNaN(productData.stock)) {
        message.error('Invalid price or stock value');
        return;
      }

      const newProduct = await productService.createProduct(productData);
      message.success('Product created successfully');
      fetchProducts();
      setAddModalVisible(false);
      addForm.resetFields();
    } catch (error) {
      // Detailed error handling
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

  const getStockStatus = (stock) => {
    if (stock > 50) return { color: 'green', text: 'Abundant' };
    if (stock > 10) return { color: 'orange', text: 'Limited' };
    return { color: 'red', text: 'Low Stock' };
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Text 
          strong 
          style={{ 
            color: '#1890ff', 
            transition: 'color 0.3s',
            '&:hover': { color: '#40a9ff' }
          }}
        >
          {text}
        </Text>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <Text 
          ellipsis={{ tooltip: text }} 
          style={{ 
            color: '#8c8c8c', 
            fontStyle: 'italic' 
          }}
        >
          {text}
        </Text>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag 
          color="processing" 
          style={{ 
            borderRadius: 4, 
            fontWeight: 'bold' 
          }}
        >
          {category}
        </Tag>
      ),
      filters: categories.map(category => ({ 
        text: category, 
        value: category 
      })),
      onFilter: (value, record) => record.category === value
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <Text 
          strong 
          style={{ 
            color: '#52c41a', 
            fontWeight: 600 
          }}
        >
          ${price.toFixed(2)}
        </Text>
      ),
      sorter: (a, b) => a.price - b.price
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => {
        const stockStatus = getStockStatus(stock);
        return (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}
          >
            <Text 
              style={{ 
                fontWeight: 'bold', 
                color: stockStatus.color,
                marginRight: 8 
              }}
            >
              {stock}
            </Text>
            <Tag 
              color={stockStatus.color} 
              style={{ 
                borderRadius: 4, 
                fontWeight: 'bold' 
              }}
            >
              {stockStatus.text}
            </Tag>
          </div>
        );
      },
      sorter: (a, b) => a.stock - b.stock
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewProduct(record)}
              style={{
                color: '#1890ff',
                transition: 'all 0.3s',
                '&:hover': { 
                  color: '#40a9ff',
                  transform: 'scale(1.1)' 
                }
              }}
            />
          </Tooltip>
          <Dropdown 
            menu={{
              items: [
                {
                  key: 'edit',
                  icon: <EditOutlined />,
                  label: 'Edit Details',
                  onClick: () => handleEditProduct(record)
                }
              ]
            }}
            trigger={['click']}
          >
            <Button 
              type="text" 
              icon={<MoreOutlined />} 
              style={{
                color: '#8c8c8c',
                transition: 'all 0.3s',
                '&:hover': { 
                  color: '#1890ff',
                  transform: 'scale(1.1)' 
                }
              }}
            />
          </Dropdown>
        </Space>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-admin-dashboard text-dark-foreground">
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
                onClick={() => setAddModalVisible(true)}
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

      {/* View Product Modal */}
      <Modal
        title="Product Details"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
      >
        {currentProduct && (
          <div>
            <Text strong>Name: </Text>
            <Text>{currentProduct.name}</Text>
            <br />
            <Text strong>Description: </Text>
            <Text>{currentProduct.description}</Text>
            <br />
            <Text strong>Category: </Text>
            <Tag color="processing">{currentProduct.category}</Tag>
            <br />
            <Text strong>Price: </Text>
            <Text style={{ color: '#52c41a' }}>
              ${currentProduct.price.toFixed(2)}
            </Text>
            <br />
            <Text strong>Stock: </Text>
            <Tag color={getStockStatus(currentProduct.stock).color}>
              {currentProduct.stock} - {getStockStatus(currentProduct.stock).text}
            </Tag>
          </div>
        )}
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        title="Edit Product Details"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onUpdateProduct}
        >
          <Form.Item 
            name="name" 
            label="Product Name" 
            rules={[{ 
              required: true, 
              message: 'Please provide a product name' 
            }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            name="description" 
            label="Description"
            rules={[{ 
              required: true, 
              message: 'Please add a description' 
            }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item 
            name="price" 
            label="Price" 
            rules={[{ 
              required: true, 
              message: 'Please enter the price' 
            }]}
          >
            <Input type="number" prefix="$" />
          </Form.Item>
          <Form.Item 
            name="category" 
            label="Category"
            rules={[{ 
              required: true, 
              message: 'Please select a category' 
            }]}
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
            label="Stock Quantity" 
            rules={[{ 
              required: true, 
              message: 'Please enter stock quantity' 
            }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
            >
              Update Product
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Product Modal */}
      <Modal
        title="Add New Product"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          addForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={onCreateProduct}
        >
          <Form.Item 
            name="name" 
            label="Product Name" 
            rules={[{ 
              required: true, 
              message: 'Please provide a product name' 
            }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>
          <Form.Item 
            name="description" 
            label="Description"
            rules={[{ 
              required: true, 
              message: 'Please add a description' 
            }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Enter product description" 
            />
          </Form.Item>
          <Form.Item 
            name="price" 
            label="Price" 
            rules={[
              { 
                required: true, 
                message: 'Please enter the price' 
              },
              {
                validator: (_, value) => {
                  const numValue = parseFloat(value);
                  if (isNaN(numValue) || numValue < 0) {
                    return Promise.reject(new Error('Price must be a positive number'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input 
              type="number" 
              prefix="$" 
              placeholder="Enter product price" 
              min={0}
              step="0.01"
            />
          </Form.Item>
          <Form.Item 
            name="category" 
            label="Category"
            rules={[{ 
              required: true, 
              message: 'Please select a category' 
            }]}
          >
            <Select placeholder="Select product category">
              {categories.map(category => (
                <Select.Option key={category} value={category}>
                  {category}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item 
            name="stock" 
            label="Stock Quantity" 
            rules={[
              { 
                required: true, 
                message: 'Please enter stock quantity' 
              },
              {
                validator: (_, value) => {
                  const numValue = parseInt(value, 10);
                  if (isNaN(numValue) || numValue < 0) {
                    return Promise.reject(new Error('Stock must be a non-negative number'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input 
              type="number" 
              placeholder="Enter initial stock quantity" 
              min={0}
            />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
            >
              Create Product
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffProducts;
