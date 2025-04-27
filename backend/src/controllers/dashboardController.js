const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Assuming you have an Order model
const Supplier = require('../models/Supplier'); // Assuming you have a Supplier model
const Product = require('../models/Product'); // Assuming you have a Product model
const Staff = require('../models/Staff'); // Assuming you have a Staff model
const Manager = require('../models/Manager'); // Assuming you have a Manager model

// Dashboard data endpoint
router.get('/', async (req, res) => {
    console.log('Dashboard route hit'); // Log statement to confirm route access
    try {
        const totalOrders = await Order.countDocuments();
        const totalSuppliers = await Supplier.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalStaff = await Staff.countDocuments();
        const totalManagers = await Manager.countDocuments();

        return res.json({
            totalOrders,
            totalSuppliers,
            totalProducts,
            totalStaff,
            totalManagers,
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
