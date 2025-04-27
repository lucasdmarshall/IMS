const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const Notification = require('./models/Notification');
const path = require('path');

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

// MongoDB connection - better approach for serverless
let isConnected = false;
let connectionPromise = null;

const connectToDatabase = async () => {
  if (isConnected) {
    console.log('=> Using existing database connection');
    return Promise.resolve();
  }

  if (connectionPromise) {
    await connectionPromise;
    isConnected = true;
    return;
  }

  console.log('=> Using new database connection');
  
  try {
    // Store the connection promise so we can reuse it if multiple requests come in at once
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Force IPv4
    });
    
    await connectionPromise;
    isConnected = true;
    console.log('=> DB Connected');
    
    return;
  } catch (error) {
    connectionPromise = null;
    isConnected = false;
    console.error('=> DB Connection error:', error);
    throw error;
  }
};

// Create Express app
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

// Serve favicon and static files to avoid 500 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content response for favicon requests
});

app.get('/favicon.png', (req, res) => {
  res.status(204).end(); // No content response for favicon requests
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  console.log('Request Headers:', req.headers);
  next();
});

// Basic health check route - doesn't require DB connection
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'not set'
  });
});

// Basic root route - doesn't require DB connection
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Inventory Management System API',
    status: 'running',
    environment: process.env.NODE_ENV || 'not set'
  });
});

// DB test route that shows environment variable info
app.get('/api/v1/env-test', (req, res) => {
  const envInfo = {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
    JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
    // Add safe partial info about MongoDB URI if it exists
    MONGODB_FORMAT: process.env.MONGODB_URI 
      ? `${process.env.MONGODB_URI.split('@')[0].split(':')[0]}:***@${process.env.MONGODB_URI.split('@')[1] || 'invalid-format'}`
      : 'missing'
  };
  
  res.json({
    status: 'success',
    environment: envInfo
  });
});

// Database connection test endpoint
app.get('/api/v1/db-test', async (req, res) => {
  try {
    await connectToDatabase();
    
    res.json({
      status: 'success',
      database: mongoose.connection.name || 'unknown',
      host: mongoose.connection.host || 'unknown',
      connected: isConnected,
      ready: mongoose.connection.readyState === 1
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection test failed',
      errorName: error.name,
      errorMessage: error.message,
    });
  }
});

// Middleware for routes that need database access
const requireDbConnection = async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error in middleware:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Database connection failed'
    });
  }
};

// Apply requireDbConnection middleware to all API routes except health checks
app.use('/api/v1/auth', requireDbConnection, authRoutes);
app.use('/api/v1/users', requireDbConnection, userRoutes);
app.use('/api/v1/products', requireDbConnection, productRoutes);
app.use('/api/v1/orders', requireDbConnection, orderRoutes);
app.use('/api/v1/suppliers', requireDbConnection, supplierRoutes);
app.use('/api/v1/purchase-orders', requireDbConnection, purchaseOrderRoutes);
app.use('/api/v1/reports', requireDbConnection, reportRoutes);
app.use('/api/v1/settings', requireDbConnection, settingsRoutes);
app.use('/api/v1/dashboard', requireDbConnection, dashboardRoutes);
app.use('/api/v1/notifications', requireDbConnection, notificationRoutes);

// Debug route for notifications
app.get('/api/v1/debug-notifications', requireDbConnection, async (req, res) => {
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

// Test endpoint to verify server is working
app.get('/api/v1/test', (req, res) => {
  res.json({ message: 'Test endpoint is working!' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// For local development only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express API for Vercel
module.exports = app;
