const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Notification must have a recipient']
  },
  type: {
    type: String,
    enum: [
      // Order-related notifications
      'order_status_change', 
      'order_assigned', 
      'order_created', 
      'order_completed',
      
      // Stock-related notifications
      'low_stock_alert',
      'stock_replenishment_needed',
      'product_out_of_stock',
      
      // Task-related notifications
      'task_assigned',
      'task_completed',
      'task_overdue',
      
      // Purchase order notifications
      'purchase_order_created',
      'purchase_order_approved',
      'purchase_order_received',
      
      // User management notifications
      'user_account_created',
      'user_role_changed',
      
      // System notifications
      'system_maintenance',
      'security_alert'
    ],
    required: [true, 'Notification must have a type']
  },
  content: {
    type: String,
    required: [true, 'Notification must have content']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  relatedEntity: {
    type: {
      entityType: {
        type: String,
        enum: ['Order', 'Product', 'PurchaseOrder', 'User', 'Task']
      },
      entityId: {
        type: mongoose.Schema.ObjectId,
        refPath: 'relatedEntity.entityType'
      }
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60 // Automatically delete after 30 days
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add an index to improve query performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// Populate recipient details when querying
notificationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'recipient',
    select: 'name email role'
  });
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
