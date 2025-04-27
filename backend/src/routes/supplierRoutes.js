const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Supplier = require('../models/supplier');

// Get all suppliers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new supplier
router.post('/', authenticateToken, async (req, res) => {
  const supplier = new Supplier({
    name: req.body.name,
    contactPerson: req.body.contactPerson,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address
  });

  try {
    const newSupplier = await supplier.save();
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a supplier
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    Object.assign(supplier, req.body);
    const updatedSupplier = await supplier.save();
    res.json(updatedSupplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a supplier
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
