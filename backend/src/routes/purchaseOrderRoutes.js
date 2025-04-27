const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const PurchaseOrder = require('../models/purchaseOrder');

// Get all purchase orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find().populate('supplier');
    res.json(purchaseOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new purchase order
router.post('/', authenticateToken, async (req, res) => {
  const purchaseOrder = new PurchaseOrder({
    supplier: req.body.supplier,
    orderDate: req.body.orderDate || new Date(),
    items: req.body.items,
    totalAmount: req.body.totalAmount,
    status: req.body.status || 'pending'
  });

  try {
    const newPurchaseOrder = await purchaseOrder.save();
    const populatedOrder = await newPurchaseOrder.populate('supplier');
    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a purchase order
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    Object.assign(purchaseOrder, req.body);
    const updatedOrder = await purchaseOrder.save();
    const populatedOrder = await updatedOrder.populate('supplier');
    res.json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a purchase order
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    await PurchaseOrder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Purchase order deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
