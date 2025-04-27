const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['sales', 'stock', 'profit_loss'],
    required: true
  },
  data: [{
    month: String,
    value: Number,
    category: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Report', ReportSchema);
