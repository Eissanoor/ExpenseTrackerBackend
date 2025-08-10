const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
  },
  { timestamps: true }
);

// Create index for better query performance
expenseSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema); 