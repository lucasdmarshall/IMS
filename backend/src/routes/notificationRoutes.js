const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Get user's notifications
router.get('/', 
  protect, 
  notificationController.getUserNotifications
);

// Mark notifications as read (multiple or all)
router.patch('/read', 
  protect, 
  notificationController.markNotificationAsRead
);

// Clear all notifications
router.delete('/clear', 
  protect, 
  notificationController.clearAllNotifications
);

// Create a notification (admin only)
router.post('/', 
  protect, 
  restrictTo('admin'),
  notificationController.createNotification
);

module.exports = router;
