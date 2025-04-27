const Notification = require('../models/Notification');
const NotificationService = require('../services/notificationService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getUserNotifications = catchAsync(async (req, res, next) => {
  const { 
    limit = 20, 
    page = 1, 
    unreadOnly = false,
    types = []
  } = req.query;

  const notifications = await NotificationService.getUserNotifications(
    req.user._id, 
    { limit: Number(limit), page: Number(page), unreadOnly: unreadOnly === 'true', types }
  );

  // Filter notifications based on user role
  const filteredNotifications = NotificationService.filterNotificationsByRole(
    notifications, 
    req.user.role
  );

  res.status(200).json({
    status: 'success',
    results: filteredNotifications.length,
    data: { 
      notifications: filteredNotifications,
      unreadCount: await Notification.countDocuments({ 
        recipient: req.user._id, 
        isRead: false 
      }) 
    }
  });
});

exports.markNotificationAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.body.notificationIds[0],
    recipient: req.user._id
  });

  if (!notification) {
    return res.status(404).json({
      status: 'error',
      message: 'Notification not found'
    });
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    status: 'success',
    data: notification
  });
});

exports.clearAllNotifications = catchAsync(async (req, res, next) => {
  await Notification.deleteMany({ 
    recipient: req.user._id 
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Create a notification (mostly for testing/admin purposes)
exports.createNotification = catchAsync(async (req, res, next) => {
  const { 
    type, 
    content, 
    severity, 
    recipients, 
    roles,
    relatedEntity,
    metadata 
  } = req.body;

  const notifications = await NotificationService.createNotification({
    type, 
    content, 
    severity, 
    recipients, 
    roles,
    relatedEntity,
    metadata
  });

  res.status(201).json({
    status: 'success',
    data: { notifications }
  });
});
