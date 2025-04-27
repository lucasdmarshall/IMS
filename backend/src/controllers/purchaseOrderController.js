const PurchaseOrder = require('../models/PurchaseOrder');
const { catchAsync } = require('../utils/errorHandlers');
const AppError = require('../utils/appError');

// Create a new purchase order
exports.createPurchaseOrder = catchAsync(async (req, res, next) => {
  // Only admin and manager can create purchase orders
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const purchaseOrderData = {
    ...req.body,
    createdBy: req.user._id
  };

  const purchaseOrder = await PurchaseOrder.create(purchaseOrderData);

  res.status(201).json({
    status: 'success',
    data: {
      purchaseOrder
    }
  });
});

// Get all purchase orders
exports.getAllPurchaseOrders = catchAsync(async (req, res, next) => {
  // Only admin and manager can view purchase orders
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const purchaseOrders = await PurchaseOrder.find()
    .populate('supplier', 'name contactPerson')
    .populate('items.product', 'name sku');

  res.status(200).json({
    status: 'success',
    results: purchaseOrders.length,
    data: {
      purchaseOrders
    }
  });
});

// Get a single purchase order
exports.getPurchaseOrder = catchAsync(async (req, res, next) => {
  // Only admin and manager can view purchase orders
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const purchaseOrder = await PurchaseOrder.findById(req.params.id)
    .populate('supplier', 'name contactPerson email phone')
    .populate('items.product', 'name sku');

  if (!purchaseOrder) {
    return next(new AppError('No purchase order found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      purchaseOrder
    }
  });
});

// Update a purchase order
exports.updatePurchaseOrder = catchAsync(async (req, res, next) => {
  // Only admin and manager can update purchase orders
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: Date.now() },
    {
      new: true,
      runValidators: true
    }
  ).populate('supplier', 'name contactPerson');

  if (!purchaseOrder) {
    return next(new AppError('No purchase order found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      purchaseOrder
    }
  });
});

// Delete a purchase order
exports.deletePurchaseOrder = catchAsync(async (req, res, next) => {
  // Only admin and manager can delete purchase orders
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const purchaseOrder = await PurchaseOrder.findByIdAndDelete(req.params.id);

  if (!purchaseOrder) {
    return next(new AppError('No purchase order found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
