const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Staff = require('../models/Staff');
const Manager = require('../models/Manager');

router.get('/', async (req, res) => {
    console.log('Dashboard route accessed');
    try {
        const [totalOrders, totalSuppliers, totalProducts, totalStaff, totalManagers] = await Promise.all([
            Order.countDocuments(),
            Supplier.countDocuments(),
            Product.countDocuments(),
            Staff.countDocuments(),
            Manager.countDocuments()
        ]);

        res.json({
            status: 'success',
            data: {
                totalOrders,
                totalSuppliers,
                totalProducts,
                totalStaff,
                totalManagers
            }
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

module.exports = router;
