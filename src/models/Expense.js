const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['food', 'transport', 'utilities', 'entertainment', 'healthcare', 'shopping', 'other'],
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
expenseSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
