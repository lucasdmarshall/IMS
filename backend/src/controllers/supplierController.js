const Supplier = require('../models/Supplier');
const { catchAsync } = require('../utils/errorHandlers');
const AppError = require('../utils/appError');

// Create a new supplier
exports.createSupplier = catchAsync(async (req, res, next) => {
  // Only admin and manager can create suppliers
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const supplierData = {
    ...req.body,
    createdBy: req.user._id
  };

  const supplier = await Supplier.create(supplierData);

  res.status(201).json({
    status: 'success',
    data: {
      supplier
    }
  });
});

// Get all suppliers
exports.getAllSuppliers = catchAsync(async (req, res, next) => {
  // Only admin and manager can view suppliers
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const suppliers = await Supplier.find({ isActive: true });

  res.status(200).json({
    status: 'success',
    results: suppliers.length,
    data: {
      suppliers
    }
  });
});

// Get a single supplier
exports.getSupplier = catchAsync(async (req, res, next) => {
  // Only admin and manager can view suppliers
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    return next(new AppError('No supplier found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      supplier
    }
  });
});

// Update a supplier
exports.updateSupplier = catchAsync(async (req, res, next) => {
  // Only admin and manager can update suppliers
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const supplier = await Supplier.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: Date.now() },
    {
      new: true,
      runValidators: true
    }
  );

  if (!supplier) {
    return next(new AppError('No supplier found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      supplier
    }
  });
});

// Delete a supplier (soft delete)
exports.deleteSupplier = catchAsync(async (req, res, next) => {
  // Only admin and manager can delete suppliers
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const supplier = await Supplier.findByIdAndUpdate(
    req.params.id,
    { isActive: false, updatedAt: Date.now() },
    { new: true }
  );

  if (!supplier) {
    return next(new AppError('No supplier found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: null
  });
});
