const mongoose = require('mongoose');

// Only ONE document exists in this collection. The warden edits it.
const pricingSchema = new mongoose.Schema({
  rents: {
    single_ac: { type: Number, required: true, min: 0 },
    single_nonac: { type: Number, required: true, min: 0 },
    double_ac: { type: Number, required: true, min: 0 },
    double_nonac: { type: Number, required: true, min: 0 },
    triple_ac: { type: Number, required: true, min: 0 },
    triple_nonac: { type: Number, required: true, min: 0 },
  },
  messCharge: { type: Number, required: true, min: 0 },
  securityDeposit: { type: Number, required: true, min: 0 },
});

module.exports = mongoose.model('Pricing', pricingSchema);