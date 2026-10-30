const express = require('express');
const router = express.Router();
const { getPricing, updatePricing } = require('../controllers/pricingController');
const { protect } = require('../middleware/auth');
const { wardenOnly } = require('../middleware/role');

router.get('/', getPricing);                          // public
router.put('/', protect, wardenOnly, updatePricing);  // warden only

module.exports = router;