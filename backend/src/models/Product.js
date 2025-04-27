const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
    unique: true, // Add unique constraint
    lowercase: true // Convert to lowercase for case-insensitive uniqueness
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide a product price'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(v) {
        return v >= 0;
      },
      message: 'Price must be a non-negative number'
    }
  },
  barcode: {
    type: String,
    trim: true,
    index: true, // Add index for faster lookups
    sparse: true // Allow null values and maintain uniqueness for non-null values
  },
  category: {
    type: String,
    required: [true, 'Please provide a product category'],
    enum: {
      values: ['Electronics', 'Clothing', 'Food', 'Books', 'Other'],
      message: 'Category must be one of: Electronics, Clothing, Food, Books, Other'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: [0, 'Stock cannot be negative'],
    validate: {
      validator: function(v) {
        return v >= 0;
      },
      message: 'Stock must be a non-negative number'
    }
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure unique index is case-insensitive
productSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

// Populate the createdBy field
productSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'createdBy',
    select: 'name email role'
  });
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
