const mongoose = require('mongoose');
const Counter = require('./Counter'); // We'll create this model to generate sequential numbers

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    default: function() {
      return `ORD-${Date.now()}`;
    },
    unique: true,
    index: true
  },
  customerName: {
    type: String,
    required: [true, 'Order must have a customer name'],
    trim: true
  },
  totalAmount: {
    type: Number,
    required: [true, 'Order must have a total amount'],
    default: 0,
    min: [0, 'Total amount cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['Paid', 'Half-Paid', 'Unpaid'],
      message: 'Payment status must be Paid, Half-Paid, or Unpaid'
    },
    default: 'Unpaid'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  description: {
    type: String,
    trim: true
  },
  managerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to a manager']
  },
  staffId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Order must be assigned to a staff member']
  },
  statusNotifications: [{
    notifiedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    notificationTime: {
      type: Date,
      default: Date.now
    },
    message: {
      type: String,
      trim: true,
      required: true
    },
    previousStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled']
    },
    newStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled']
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexing for performance
orderSchema.index({ managerId: 1 });
orderSchema.index({ staffId: 1 });
orderSchema.index({ status: 1 });

// Virtual populate to get staff details
orderSchema.virtual('assignedStaff', {
  ref: 'User',
  foreignField: '_id',
  localField: 'assignedTo'
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
