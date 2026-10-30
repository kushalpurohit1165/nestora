const Pricing = require('../models/Pricing');

// GET /api/pricing  (public)
const getPricing = async (req, res, next) => {
  try {
    const pricing = await Pricing.findOne();
    if (!pricing) {
      const error = new Error('Pricing not set up yet. Run the seed script');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, pricing });
  } catch (err) {
    next(err);
  }
};

// PUT /api/pricing  (warden) - edits the single pricing document
const updatePricing = async (req, res, next) => {
  try {
    const { rents, messCharge, securityDeposit } = req.body;

    const pricing = await Pricing.findOneAndUpdate(
      {},
      { rents, messCharge, securityDeposit },
      { new: true, runValidators: true, upsert: true } // upsert: create if it does not exist
    );

    res.status(200).json({ success: true, message: 'Pricing updated', pricing });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPricing, updatePricing };