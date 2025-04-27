const Report = require('../models/Report');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { catchAsync } = require('../utils/errorHandlers');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

// Generate dynamic sales report
const generateSalesReport = async () => {
  // Aggregate monthly sales
  const salesReport = await Order.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { 
          $gte: new Date(new Date().getFullYear(), 0, 1),
          $lte: new Date(new Date().getFullYear(), 11, 31)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalSales: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    },
    {
      $project: {
        month: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 1] }, then: 'Jan' },
              { case: { $eq: ['$_id', 2] }, then: 'Feb' },
              { case: { $eq: ['$_id', 3] }, then: 'Mar' },
              { case: { $eq: ['$_id', 4] }, then: 'Apr' },
              { case: { $eq: ['$_id', 5] }, then: 'May' },
              { case: { $eq: ['$_id', 6] }, then: 'Jun' },
              { case: { $eq: ['$_id', 7] }, then: 'Jul' },
              { case: { $eq: ['$_id', 8] }, then: 'Aug' },
              { case: { $eq: ['$_id', 9] }, then: 'Sep' },
              { case: { $eq: ['$_id', 10] }, then: 'Oct' },
              { case: { $eq: ['$_id', 11] }, then: 'Nov' },
              { case: { $eq: ['$_id', 12] }, then: 'Dec' }
            ],
            default: 'Unknown'
          }
        },
        value: '$totalSales',
        orderCount: 1
      }
    }
  ]);

  return salesReport.length > 0 ? salesReport : [
    { month: 'Jan', value: 0, orderCount: 0 },
    { month: 'Feb', value: 0, orderCount: 0 },
    { month: 'Mar', value: 0, orderCount: 0 },
    { month: 'Apr', value: 0, orderCount: 0 },
    { month: 'May', value: 0, orderCount: 0 },
    { month: 'Jun', value: 0, orderCount: 0 }
  ];
};

// Generate dynamic stock report
const generateStockReport = async () => {
  const stockReport = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        value: { $sum: '$stockQuantity' },
        totalProducts: { $sum: 1 },
        averagePrice: { $avg: '$price' }
      }
    },
    {
      $project: {
        category: '$_id',
        value: 1,
        totalProducts: 1,
        averagePrice: { $round: ['$averagePrice', 2] }
      }
    },
    {
      $sort: { value: -1 }
    }
  ]);

  return stockReport.length > 0 ? stockReport : [
    { category: 'Electronics', value: 0, totalProducts: 0, averagePrice: 0 },
    { category: 'Clothing', value: 0, totalProducts: 0, averagePrice: 0 },
    { category: 'Home Goods', value: 0, totalProducts: 0, averagePrice: 0 },
    { category: 'Accessories', value: 0, totalProducts: 0, averagePrice: 0 }
  ];
};

// Generate dynamic profit/loss report
const generateProfitLossReport = async () => {
  const profitLossReport = await Order.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { 
          $gte: new Date(new Date().getFullYear(), 0, 1),
          $lte: new Date(new Date().getFullYear(), 11, 31)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalRevenue: { $sum: '$totalAmount' },
        totalCost: { $sum: '$totalCost' }
      }
    },
    {
      $sort: { _id: 1 }
    },
    {
      $project: {
        month: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 1] }, then: 'Jan' },
              { case: { $eq: ['$_id', 2] }, then: 'Feb' },
              { case: { $eq: ['$_id', 3] }, then: 'Mar' },
              { case: { $eq: ['$_id', 4] }, then: 'Apr' },
              { case: { $eq: ['$_id', 5] }, then: 'May' },
              { case: { $eq: ['$_id', 6] }, then: 'Jun' },
              { case: { $eq: ['$_id', 7] }, then: 'Jul' },
              { case: { $eq: ['$_id', 8] }, then: 'Aug' },
              { case: { $eq: ['$_id', 9] }, then: 'Sep' },
              { case: { $eq: ['$_id', 10] }, then: 'Oct' },
              { case: { $eq: ['$_id', 11] }, then: 'Nov' },
              { case: { $eq: ['$_id', 12] }, then: 'Dec' }
            ],
            default: 'Unknown'
          }
        },
        value: { $subtract: ['$totalRevenue', '$totalCost'] },
        totalRevenue: 1,
        totalCost: 1
      }
    }
  ]);

  return profitLossReport.length > 0 ? profitLossReport : [
    { month: 'Jan', value: 0, totalRevenue: 0, totalCost: 0 },
    { month: 'Feb', value: 0, totalRevenue: 0, totalCost: 0 },
    { month: 'Mar', value: 0, totalRevenue: 0, totalCost: 0 },
    { month: 'Apr', value: 0, totalRevenue: 0, totalCost: 0 },
    { month: 'May', value: 0, totalRevenue: 0, totalCost: 0 },
    { month: 'Jun', value: 0, totalRevenue: 0, totalCost: 0 }
  ];
};

// Get report by type
exports.getReport = catchAsync(async (req, res, next) => {
  const { type } = req.params;

  // Validate report type
  const validTypes = ['sales', 'stock', 'profit_loss'];
  if (!validTypes.includes(type)) {
    return next(new AppError('Invalid report type', 400));
  }

  // Only admin and manager can access reports
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new AppError('You do not have permission to access reports', 403));
  }

  // For manager, block financial reports
  if (req.user.role === 'manager' && type === 'profit_loss') {
    return next(new AppError('You do not have permission to access financial reports', 403));
  }

  // Generate dynamic report based on type
  let reportData;
  switch (type) {
    case 'sales':
      reportData = await generateSalesReport();
      break;
    case 'stock':
      reportData = await generateStockReport();
      break;
    case 'profit_loss':
      reportData = await generateProfitLossReport();
      break;
  }

  res.status(200).json({
    status: 'success',
    data: reportData
  });
});

// Create or update a report (for admin only)
exports.createOrUpdateReport = catchAsync(async (req, res, next) => {
  // Only admin can create or update reports
  if (req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to modify reports', 403));
  }

  const { type, data } = req.body;

  // Validate report type
  const validTypes = ['sales', 'stock', 'profit_loss'];
  if (!validTypes.includes(type)) {
    return next(new AppError('Invalid report type', 400));
  }

  // Create or update the report
  const report = await Report.findOneAndUpdate(
    { type },
    { 
      type, 
      data,
      updatedAt: Date.now() 
    },
    { 
      upsert: true, 
      new: true, 
      runValidators: true 
    }
  );

  res.status(201).json({
    status: 'success',
    data: report
  });
});

// Get all report types (for admin dashboard)
exports.getAllReportTypes = catchAsync(async (req, res, next) => {
  // Only admin can access all report types
  if (req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to access all report types', 403));
  }

  const reportTypes = await Report.distinct('type');

  res.status(200).json({
    status: 'success',
    data: reportTypes
  });
});
