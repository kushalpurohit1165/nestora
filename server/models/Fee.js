const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  // Relation: which student this fee belongs to
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['rent', 'mess', 'deposit'], required: true },
  month: { type: String, default: '' }, // like "2026-11"; empty for the deposit
  amount: { type: Number, required: [true, 'Amount is required'], min: 0 },
  // Only 3 statuses are stored. "Overdue" is calculated from the date, not saved.
  status: { type: String, enum: ['Pending', 'Paid', 'Refunded'], default: 'Pending' },
  paidOn: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Database optimization: index on status, because stats and filters search by it often
feeSchema.index({ status: 1 });

module.exports = mongoose.model('Fee', feeSchema);