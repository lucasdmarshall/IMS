const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Report = require('../models/Report');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedDatabase = async () => {
  try {
    // Connect to the database
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Report.deleteMany({});

    // Create seed users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@inventory.com',
        password: 'AdminPass123!',
        role: 'admin'
      },
      {
        name: 'Manager User',
        email: 'manager@inventory.com',
        password: 'ManagerPass123!',
        role: 'manager'
      },
      {
        name: 'Staff User',
        email: 'staff@inventory.com',
        password: 'StaffPass123!',
        role: 'staff'
      }
    ];

    // Insert users
    const createdUsers = await User.create(users);
    console.log('Users created successfully:');
    createdUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Create seed reports
    const salesReportData = {
      type: 'sales',
      data: [
        { month: 'Jan', value: 15000 },
        { month: 'Feb', value: 18500 },
        { month: 'Mar', value: 22000 },
        { month: 'Apr', value: 20000 },
        { month: 'May', value: 25000 },
        { month: 'Jun', value: 30000 }
      ]
    };

    const stockReportData = {
      type: 'stock',
      data: [
        { category: 'Electronics', value: 250 },
        { category: 'Clothing', value: 180 },
        { category: 'Home Goods', value: 220 },
        { category: 'Accessories', value: 150 }
      ]
    };

    const profitLossReportData = {
      type: 'profit_loss',
      data: [
        { month: 'Jan', value: 5000 },
        { month: 'Feb', value: 6200 },
        { month: 'Mar', value: 7500 },
        { month: 'Apr', value: 6800 },
        { month: 'May', value: 8000 },
        { month: 'Jun', value: 9500 }
      ]
    };

    // Insert reports
    await Report.create([
      salesReportData,
      stockReportData,
      profitLossReportData
    ]);

    console.log('Reports created successfully');

    // Close the connection
    await mongoose.connection.close();
    console.log('Seeding completed');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
