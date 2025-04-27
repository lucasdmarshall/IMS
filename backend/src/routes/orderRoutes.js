const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Logging middleware
router.use((req, res, next) => {
  console.log('Order Route Request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    user: req.user
  });
  next();
});

// Get all orders (accessible to all authenticated users)
router.get('/', protect, orderController.getAllOrders);

// Create a new order
router.post('/', protect, restrictTo('admin', 'manager'), orderController.createOrder);

// Get a single order by ID
router.get('/:id', protect, orderController.getOrder);

// Get staff-specific orders
router.get('/staff/:staffId', protect, restrictTo('staff', 'manager', 'admin'), orderController.getStaffOrders);

// Update an order
router.put('/:id', protect, restrictTo('admin', 'manager'), orderController.updateOrder);

// Delete an order
router.delete('/:id', protect, restrictTo('admin', 'manager'), orderController.deleteOrder);

// Notify order status
router.patch('/:orderId/notify-status', protect, restrictTo('staff', 'manager'), orderController.notifyOrderStatus);

module.exports = router;
