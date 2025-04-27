const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const Notification = require('./models/Notification');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middleware
const corsOptions = {
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  console.log('Request Headers:', req.headers);
  next();
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/purchase-orders', purchaseOrderRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Debug route for notifications
app.get('/api/v1/debug-notifications', async (req, res) => {
  try {
    // Use a valid MongoDB ObjectId format for testing
    const debugUserId = '000000000000000000000123';
    
    // Find existing notification or create a new one
    let notification = await Notification.findOne({
      _id: '000000000000000000000001'
    });
    
    if (!notification) {
      // Create a new notification if one doesn't exist
      notification = await Notification.create({
        _id: '000000000000000000000001', 
        content: 'Debug notification',
        recipient: debugUserId,
        type: 'system_maintenance',
        isRead: false
      });
    }

    // Return a debug notification response
    res.status(200).json({
      status: 'success',
      data: {
        notifications: [notification],
        unreadCount: 1
      }
    });
  } catch (error) {
    console.error('Debug notification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process debug notification',
      error: error.message
    });
  }
});

// Main notification routes
app.use('/api/v1/notifications', notificationRoutes);

// Test endpoint to verify server is working
app.get('/api/v1/test', (req, res) => {
  res.json({ message: 'Test endpoint is working!' });
});

// Debug route to verify API is working
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Inventory Management System API',
    status: 'running'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express API for Vercel
module.exports = app;
