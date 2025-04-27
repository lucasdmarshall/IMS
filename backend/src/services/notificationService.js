const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  // Create a notification for specific users or roles
  static async createNotification({
    type,
    content,
    severity = 'low',
    recipients = [],
    roles = [],
    relatedEntity = null,
    metadata = {}
  }) {
    try {
      // If roles are specified, find users with those roles
      if (roles.length > 0) {
        const usersWithRoles = await User.find({ role: { $in: roles } });
        recipients = [...recipients, ...usersWithRoles.map(user => user._id)];
      }

      // Remove duplicates
      recipients = [...new Set(recipients)];

      // Create notifications for each recipient
      const notifications = recipients.map(recipient => ({
        recipient,
        type,
        content,
        severity,
        relatedEntity,
        metadata,
        isRead: false
      }));

      return await Notification.insertMany(notifications);
    } catch (error) {
      console.error('Error creating notifications:', error);
      throw error;
    }
  }

  // Get notifications for a specific user
  static async getUserNotifications(userId, options = {}) {
    const { 
      limit = 20, 
      page = 1, 
      unreadOnly = false,
      types = []
    } = options;

    const query = { recipient: userId };
    
    if (unreadOnly) {
      query.isRead = false;
    }

    if (types.length > 0) {
      query.type = { $in: types };
    }

    return await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
  }

  // Mark notifications as read
  static async markNotificationsAsRead(userId, notificationIds = []) {
    const query = { 
      recipient: userId,
      ...(notificationIds.length > 0 ? { _id: { $in: notificationIds } } : {})
    };

    return await Notification.updateMany(
      query, 
      { isRead: true }
    );
  }

  // Role-based notification filtering
  static filterNotificationsByRole(notifications, userRole) {
    switch (userRole) {
      case 'admin':
        return notifications; // All notifications for admin
      case 'manager':
        return notifications.filter(notification => 
          ['order_status_change', 'low_stock_alert', 'stock_replenishment_needed', 'purchase_order_created'].includes(notification.type)
        );
      case 'staff':
        return notifications.filter(notification => 
          ['task_assigned', 'task_completed', 'order_assigned'].includes(notification.type)
        );
      default:
        return []; // No notifications for unknown roles
    }
  }
}

module.exports = NotificationService;
