const express = require('express');
const { getAllRefunds, approveRefund, rejectRefund } = require('../controllers/refundController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Admin routes
router.get('/', restrictTo('admin', 'manager'), getAllRefunds);
router.post('/approve/:id', restrictTo('admin'), approveRefund);
router.post('/reject/:id', restrictTo('admin'), rejectRefund);

module.exports = router;
