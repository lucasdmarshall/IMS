const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  model: { 
    type: String, 
    required: true, 
    unique: true 
  },
  sequence: { 
    type: Number, 
    default: 0,
    min: 0
  }
}, {
  timestamps: true,  // Add timestamps for tracking
  optimisticConcurrency: true  // Enable optimistic concurrency control
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
