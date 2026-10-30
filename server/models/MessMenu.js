const mongoose = require('mongoose');

// One document per day of the week
const messMenuSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
    unique: true,
  },
  breakfast: { type: String, default: '' },
  lunch: { type: String, default: '' },
  snacks: { type: String, default: '' },
  dinner: { type: String, default: '' },
});

module.exports = mongoose.model('MessMenu', messMenuSchema);