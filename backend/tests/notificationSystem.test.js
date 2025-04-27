require('dotenv').config({ path: '.env.test' });
const mongoose = require('mongoose');
const NotificationService = require('../src/services/notificationService');
const Notification = require('../src/models/Notification');
const User = require('../src/models/User');

describe('Notification System', () => {
  let adminUser, managerUser, staffUser;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_TEST_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Clear existing data
    await User.deleteMany({});
    await Notification.deleteMany({});

    // Create test users
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'admin',
      password: 'testpassword123'
    });

    managerUser = await User.create({
      name: 'Manager User',
      email: 'manager@test.com',
      role: 'manager',
      password: 'testpassword123'
    });

    staffUser = await User.create({
      name: 'Staff User',
      email: 'staff@test.com',
      role: 'staff',
      password: 'testpassword123'
    });
  }, 10000);

  afterAll(async () => {
    // Clean up test users and notifications
    await User.deleteMany({});
    await Notification.deleteMany({});
    await mongoose.connection.close();
  }, 10000);

  describe('Notification Creation', () => {
    test('should create notifications for specific roles', async () => {
      // Create low stock alert for managers
      const lowStockNotifications = await NotificationService.createNotification({
        type: 'low_stock_alert',
        content: 'Laptop inventory below 10 units',
        severity: 'high',
        roles: ['manager']
      });

      expect(lowStockNotifications.length).toBeGreaterThan(0);
      expect(lowStockNotifications[0].recipient.toString()).toBe(managerUser._id.toString());
    });

    test('should create task assignment notification for staff', async () => {
      const taskNotifications = await NotificationService.createNotification({
        type: 'task_assigned',
        content: 'New order processing task',
        recipients: [staffUser._id]
      });

      expect(taskNotifications.length).toBe(1);
      expect(taskNotifications[0].recipient.toString()).toBe(staffUser._id.toString());
    });

    test('should create system-wide notification', async () => {
      const systemNotifications = await NotificationService.createNotification({
        type: 'system_maintenance',
        content: 'System maintenance scheduled',
        severity: 'medium',
        roles: ['admin', 'manager', 'staff']
      });

      expect(systemNotifications.length).toBe(3);
    });
  });

  describe('Notification Filtering', () => {
    beforeEach(async () => {
      // Clear existing notifications
      await Notification.deleteMany({});

      // Create sample notifications
      await NotificationService.createNotification({
        type: 'order_status_change',
        content: 'Order #1234 status updated',
        recipients: [adminUser._id, managerUser._id]
      });

      await NotificationService.createNotification({
        type: 'task_assigned',
        content: 'New task assigned',
        recipients: [staffUser._id]
      });

      await NotificationService.createNotification({
        type: 'low_stock_alert',
        content: 'Low stock warning',
        recipients: [managerUser._id]
      });
    });

    test('admin should see all notifications', async () => {
      const adminNotifications = await NotificationService.getUserNotifications(adminUser._id);
      const filteredNotifications = NotificationService.filterNotificationsByRole(
        adminNotifications, 
        'admin'
      );

      expect(filteredNotifications.length).toBeGreaterThan(0);
    });

    test('manager should see only relevant notifications', async () => {
      const managerNotifications = await NotificationService.getUserNotifications(managerUser._id);
      const filteredNotifications = NotificationService.filterNotificationsByRole(
        managerNotifications, 
        'manager'
      );

      expect(filteredNotifications.some(n => 
        ['order_status_change', 'low_stock_alert'].includes(n.type)
      )).toBe(true);
    });

    test('staff should see only task-related notifications', async () => {
      const staffNotifications = await NotificationService.getUserNotifications(staffUser._id);
      const filteredNotifications = NotificationService.filterNotificationsByRole(
        staffNotifications, 
        'staff'
      );

      expect(filteredNotifications.every(n => 
        ['task_assigned', 'task_completed', 'order_assigned'].includes(n.type)
      )).toBe(true);
    });
  });

  describe('Notification Management', () => {
    test('should mark notifications as read', async () => {
      // Create some notifications
      const notifications = await NotificationService.createNotification({
        type: 'order_created',
        content: 'New order received',
        recipients: [adminUser._id]
      });

      // Mark notifications as read
      const result = await NotificationService.markNotificationsAsRead(
        adminUser._id, 
        notifications.map(n => n._id)
      );

      expect(result.modifiedCount).toBeGreaterThan(0);

      // Verify notifications are marked as read
      const readNotifications = await Notification.find({
        _id: { $in: notifications.map(n => n._id) },
        isRead: true
      });

      expect(readNotifications.length).toBe(notifications.length);
    });
  });
});
