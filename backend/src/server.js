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

// MongoDB connection - cached connection for serverless environment
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    console.log('Using cached database connection');
    return cachedDb;
  }
  
  try {
    // Connection options for better serverless performance
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: false, // Don't build indexes automatically in production
      maxPoolSize: 10 // Maintain up to 10 socket connections
    };
    
    console.log('Connecting to MongoDB...', process.env.MONGODB_URI ? 'URI exists' : 'URI missing');
    console.log('Connection string format check:', process.env.MONGODB_URI?.startsWith('mongodb+srv://') ? 'Valid format' : 'Invalid format');
    
    const client = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('Connected to MongoDB successfully');
    
    cachedDb = client;
    return client;
  } catch (error) {
    console.error('MongoDB connection error details:', error.name, error.message);
    console.error('Connection stack:', error.stack);
    throw error;
  }
}

// Basic health check that doesn't require DB
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

// Connect to DB before handling routes that need it
app.use(async (req, res, next) => {
  // Skip DB connection for basic routes
  if (req.path === '/' || req.path === '/api/v1/health') {
    return next();
  }
  
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Failed to connect to database:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
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
app.use('/api/v1/notifications', notificationRoutes);

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

// Test endpoint to verify server is working
app.get('/api/v1/test', (req, res) => {
  res.json({ message: 'Test endpoint is working!' });
});

// Database connection test endpoint
app.get('/api/v1/db-test', async (req, res) => {
  try {
    // First check if environment variables exist
    const envCheck = {
      MONGODB_URI: process.env.MONGODB_URI ? 'exists' : 'missing',
      JWT_SECRET: process.env.JWT_SECRET ? 'exists' : 'missing',
      NODE_ENV: process.env.NODE_ENV || 'not set'
    };
    
    console.log('Environment check:', envCheck);
    
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        status: 'error',
        message: 'MONGODB_URI environment variable is missing',
        envCheck
      });
    }
    
    await connectToDatabase();
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({
      status: 'success',
      connection: statusMap[dbStatus] || 'unknown',
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      ready: dbStatus === 1,
      environment: process.env.NODE_ENV,
      envCheck
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection test failed',
      errorName: error.name,
      errorMessage: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
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

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express API for Vercel
module.exports = app;
