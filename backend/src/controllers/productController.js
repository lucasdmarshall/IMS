const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const axios = require('axios');

const fetchOnlineProduct = async (barcode) => {
  try {
    const response = await axios.get(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`
    );

    if (response.data?.items?.[0]) {
      const item = response.data.items[0];
      return {
        name: item.title,
        barcode: item.upc,
        category: item.category?.split('/')[0] || 'General',
        brand: item.brand,
        specifications: {
          description: item.description,
          features: item.features,
          dimensions: item.dimension,
          weight: item.weight
        }
      };
    }
    return null;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new AppError('Barcode lookup limit reached (100/day)', 429);
    }
    console.error('UPCitemDB API error:', error);
    return null;
  }
};

exports.getAllProducts = catchAsync(async (req, res, next) => {
  console.log('Get All Products Request:', {
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    },
    query: req.query
  });

  const products = await Product.find();

  console.log('Products Retrieved:', {
    count: products.length,
    firstProduct: products[0]
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products
    }
  });
});

exports.getProductByBarcode = catchAsync(async (req, res, next) => {
  try {
    console.log('Get Product By Barcode Request:', {
      user: {
        id: req.user?.id,
        email: req.user?.email,
        role: req.user?.role
      },
      barcode: req.params.barcode
    });

    if (!req.params.barcode) {
      console.error('Missing barcode parameter');
      return next(new AppError('Barcode parameter is required', 400));
    }

    // First, check our local database
    const product = await Product.findOne({ barcode: req.params.barcode });
    
    // If product exists in our database, return it
    if (product) {
      console.log('Product Retrieved From Local Database:', {
        productId: product._id,
        name: product.name,
        barcode: product.barcode
      });

      return res.status(200).json({
        status: 'success',
        source: 'local',
        data: product
      });
    }
    
    // If not found locally, try to fetch from UPCitemDB API
    console.log(`Product not found locally, searching online for barcode: ${req.params.barcode}`);
    
    const onlineProduct = await fetchOnlineProduct(req.params.barcode);

    if (onlineProduct) {
      console.log('Product Retrieved From Online API:', {
        name: onlineProduct.name,
        barcode: onlineProduct.barcode
      });

      return res.status(200).json({
        status: 'success',
        source: 'online',
        data: onlineProduct
      });
    } else {
      console.log(`No product found online with barcode: ${req.params.barcode}`);
      return next(new AppError('Product not found in database or online', 404));
    }
  } catch (error) {
    console.error('Error in getProductByBarcode:', error);
    return next(new AppError('Error processing barcode request', 500));
  }
});

exports.getProduct = catchAsync(async (req, res, next) => {
  console.log('Get Single Product Request:', {
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    },
    productId: req.params.id
  });

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  console.log('Product Retrieved:', {
    productId: product._id,
    name: product.name
  });

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  // Check if user has permission to create product (admin, manager, or staff)
  if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.role !== 'staff') {
    return next(new AppError('You do not have permission to create products', 403));
  }

  console.log('Create Product Request:', {
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    },
    productData: req.body
  });

  const { name, description, price, category, stock } = req.body;

  // Additional validation
  if (name.trim().length > 100) {
    return next(new AppError('Product name cannot exceed 100 characters', 400));
  }

  // Check for existing product with the same name (case-insensitive)
  const existingProduct = await Product.findOne({ 
    name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
  });

  if (existingProduct) {
    return next(new AppError(`A product with the name "${name}" already exists`, 400));
  }

  try {
    const newProduct = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price,
      category,
      stock,
      createdBy: req.user._id
    });

    console.log('Product Created:', {
      productId: newProduct._id,
      name: newProduct.name
    });

    res.status(201).json({
      status: 'success',
      data: {
        product: newProduct
      }
    });
  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return next(new AppError(`Invalid product data: ${errors.join(', ')}`, 400));
    }
    
    // Handle other potential errors
    return next(new AppError('Failed to create product. Please check your input.', 500));
  }
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  // Check if user has permission to update product (admin, manager, or staff)
  if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.role !== 'staff') {
    return next(new AppError('You do not have permission to update products', 403));
  }

  console.log('Update Product Request:', {
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    },
    productId: req.params.id,
    updateData: req.body
  });

  const { name, description, price, category, stock } = req.body;

  const product = await Product.findByIdAndUpdate(
    req.params.id, 
    { name, description, price, category, stock },
    { new: true, runValidators: true }
  );

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  console.log('Product Updated:', {
    productId: product._id,
    name: product.name
  });

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  // Check if user has permission to delete product (admin or manager)
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new AppError('You do not have permission to delete products', 403));
  }

  console.log('Delete Product Request:', {
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    },
    productId: req.params.id
  });

  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  console.log('Product Deleted:', {
    productId: product._id,
    name: product.name
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
