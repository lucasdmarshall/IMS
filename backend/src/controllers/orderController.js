const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Notification = require('../models/Notification'); // Assuming Notification model is defined in another file

exports.getAllOrders = catchAsync(async (req, res, next) => {
  console.log('Fetching All Orders - Request Context:', {
    user: req.user ? {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    } : 'NO USER',
    query: req.query
  });

  // Basic query to fetch all orders
  const orders = await Order.find({})
    .populate('managerId', 'name email')
    .populate('assignedTo', 'name email');
  
  console.log('Orders Fetched:', {
    totalCount: orders.length,
    orderDetails: orders.map(order => ({
      id: order._id,
      customerName: order.customerName,
      managerId: order.managerId?._id,
      assignedTo: order.assignedTo?._id,
      status: order.status
    }))
  });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders }
  });
});

exports.getManagerOrders = exports.getAllOrders;

exports.getStaffOrders = catchAsync(async (req, res, next) => {
  const { staffId } = req.params;
  const user = req.user;

  // Ensure staff can only access their own orders
  // Managers and admins can access any staff's orders
  if (user.role === 'staff' && user._id.toString() !== staffId) {
    return next(new AppError('You can only access your own orders', 403));
  }

  const orders = await Order.find({ 
    assignedTo: staffId,
    status: { $ne: 'Deleted' } 
  })
  .populate('assignedTo', 'name email')
  .populate('managerId', 'name email')
  .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders }
  });
});

exports.createOrder = catchAsync(async (req, res, next) => {
  // Validate input data
  const { 
    customerName, 
    totalAmount, 
    managerId, 
    assignedTo, 
    paymentStatus = 'Unpaid' 
  } = req.body;

  // Ensure required fields are present
  if (!customerName) {
    return next(new AppError('Customer name is required', 400));
  }

  // Ensure totalAmount is a valid number
  const amount = Number(totalAmount);
  if (isNaN(amount) || amount < 0) {
    return next(new AppError('Total amount must be a valid non-negative number', 400));
  }

  // Validate payment status
  const validPaymentStatuses = ['Paid', 'Half-Paid', 'Unpaid'];
  const normalizedPaymentStatus = paymentStatus 
    ? paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1).replace('-', '-')
    : 'Unpaid';

  if (!validPaymentStatuses.includes(normalizedPaymentStatus)) {
    return next(new AppError('Invalid payment status', 400));
  }

  // Set managerId from authenticated user if not provided
  const orderData = {
    ...req.body,
    totalAmount: amount,
    managerId: managerId || req.user._id,
    paymentStatus: normalizedPaymentStatus,
    assignedTo: assignedTo || req.user._id
  };

  // Create order with validated data
  try {
    // Ensure orderNumber is unique by appending a random suffix if needed
    const baseOrderNumber = `ORD-${Date.now()}`;
    const orderDataWithOrderNumber = {
      ...orderData,
      orderNumber: baseOrderNumber
    };

    const newOrder = await Order.create(orderDataWithOrderNumber);

    // Populate assigned staff details
    await newOrder.populate('assignedTo', 'name email');

    res.status(201).json({
      status: 'success',
      data: { 
        order: {
          ...newOrder.toObject(),
          totalAmount: Number(newOrder.totalAmount).toFixed(2),
          orderNumber: newOrder.orderNumber
        }
      }
    });
  } catch (error) {
    console.error('Order Creation Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      validationErrors: error.errors
    });

    // Check for duplicate key error
    if (error.code === 11000) {
      // If duplicate order number, retry with a different number
      try {
        const retryOrderData = {
          ...orderData,
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        };
        
        const retryOrder = await Order.create(retryOrderData);
        await retryOrder.populate('assignedTo', 'name email');

        return res.status(201).json({
          status: 'success',
          data: { 
            order: {
              ...retryOrder.toObject(),
              totalAmount: Number(retryOrder.totalAmount).toFixed(2),
              orderNumber: retryOrder.orderNumber
            }
          }
        });
      } catch (retryError) {
        return next(new AppError(`Failed to create order: ${retryError.message}`, 500));
      }
    }

    next(new AppError(`Order creation failed: ${error.message}`, 500));
  }
});

exports.updateOrder = catchAsync(async (req, res, next) => {
  console.log('Update Order - User:', req.user, 'Order ID:', req.params.id, 'Update Data:', req.body);
  
  // Normalize payment status
  const updateData = { ...req.body };
  if (updateData.paymentStatus) {
    const normalizedPaymentStatus = updateData.paymentStatus
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('-')
      .replace('half-Paid', 'Half-Paid');
    
    updateData.paymentStatus = normalizedPaymentStatus;
  }

  // Validate assignedTo
  if (!updateData.assignedTo) {
    return next(new AppError('Order must be assigned to a staff member', 400));
  }

  // Find the order first to ensure it exists
  const existingOrder = await Order.findById(req.params.id);
  
  if (!existingOrder) {
    console.log('Order not found:', req.params.id);
    return next(new AppError('No order found with that ID', 404));
  }

  // Update the order
  const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  }).populate('managerId', 'name email')
    .populate('assignedTo', 'name email');
  
  console.log('Updated Order:', {
    orderId: updatedOrder._id,
    customerName: updatedOrder.customerName,
    assignedTo: updatedOrder.assignedTo?._id,
    assignedToName: updatedOrder.assignedTo?.name
  });
  
  res.status(200).json({
    status: 'success',
    data: { 
      order: updatedOrder 
    }
  });
});

exports.deleteOrder = catchAsync(async (req, res, next) => {
  console.log('Delete Order - User:', req.user, 'Order ID:', req.params.id);
  
  const deletedOrder = await Order.findByIdAndDelete(req.params.id);
  
  if (!deletedOrder) {
    console.log('Order not found:', req.params.id);
    return next(new AppError('No order found with that ID', 404));
  }
  
  console.log('Deleted Order:', deletedOrder);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// DEBUG METHOD: Get order details by ID
exports.getOrderDetails = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate('managerId', 'name email')
    .populate('assignedTo', 'name email');

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  console.log('ORDER DETAILS DEBUG:', {
    orderId: order._id,
    customerName: order.customerName,
    managerId: order.managerId?._id,
    managerName: order.managerId?.name,
    managerEmail: order.managerId?.email,
    status: order.status
  });

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  console.log('Get Single Order - Request:', {
    user: req.user ? {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role
    } : 'NO USER',
    orderId: req.params.id
  });

  const order = await Order.findById(req.params.id)
    .populate('managerId', 'name email')
    .populate('assignedTo', 'name email');

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  console.log('Single Order Details:', {
    orderId: order._id,
    customerName: order.customerName,
    status: order.status,
    managerId: order.managerId?._id,
    assignedTo: order.assignedTo?._id
  });

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

exports.notifyOrderStatus = catchAsync(async (req, res, next) => {
  console.log('Notify Order Status Request:', {
    body: req.body,
    params: req.params,
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role
    }
  });

  const { orderId } = req.params;
  const { 
    status, 
    message 
  } = req.body;

  // Validate input
  if (!status || !message) {
    return next(new AppError('Status and message are required', 400));
  }

  // Find the order with full details
  const order = await Order.findById(orderId)
    .populate('managerId', 'name email')
    .populate('assignedTo', 'name email');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Ensure only assigned staff or manager can notify
  if (
    !order.assignedTo || 
    (order.assignedTo._id.toString() !== req.user._id.toString() && 
     order.managerId._id.toString() !== req.user._id.toString())
  ) {
    return next(new AppError('You are not authorized to update this order', 403));
  }

  // Validate status
  const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  // Add status notification
  order.statusNotifications.push({
    notifiedBy: req.user._id,
    message,
    previousStatus: order.status,
    newStatus: status
  });

  // Update order status
  order.status = status;

  await order.save();

  // Send notification to manager (if different from current user)
  if (order.managerId && order.managerId._id.toString() !== req.user._id.toString()) {
    try {
      await sendNotificationToManager({
        managerId: order.managerId._id,
        orderId: order._id,
        notifiedBy: req.user.name,
        previousStatus: order.statusNotifications[order.statusNotifications.length - 1].previousStatus,
        newStatus: status,
        message
      });
    } catch (notificationError) {
      console.error('Manager Notification Error:', notificationError);
    }
  }

  // Populate notification details for response
  await order.populate([
    { path: 'statusNotifications.notifiedBy', select: 'name email' },
    { path: 'managerId', select: 'name email' },
    { path: 'assignedTo', select: 'name email' }
  ]);

  console.log('Order Status Notification Response:', {
    orderId: order._id,
    newStatus: order.status,
    managerId: order.managerId?._id,
    notifications: order.statusNotifications
  });

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

// Helper function to send notification to manager
async function sendNotificationToManager(notificationData) {
  // You can implement various notification methods here:
  // 1. Socket.io notification
  // 2. Email notification
  // 3. Push notification
  // 4. In-app notification system

  console.log('Manager Notification:', notificationData);

  // Example: Sending a basic notification log
  await Notification.create({
    recipient: notificationData.managerId,
    type: 'order_status_change',
    content: `Order ${notificationData.orderId} status changed from ${notificationData.previousStatus} to ${notificationData.newStatus} by ${notificationData.notifiedBy}. Message: ${notificationData.message}`
  });

  // You could also trigger email or other notification methods here
}
