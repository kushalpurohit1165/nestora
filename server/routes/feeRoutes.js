const express = require('express');
const router = express.Router();
const {
  getMyFees, getAllFees, generateFees, markPaid, getFeeStats,
} = require('../controllers/feeController');
const { protect } = require('../middleware/auth');
const { wardenOnly } = require('../middleware/role');

router.get('/mine', protect, getMyFees);                 // student: my own fees

// Warden routes (/stats and /generate come before /:id routes)
router.get('/stats', protect, wardenOnly, getFeeStats);
router.post('/generate', protect, wardenOnly, generateFees);
router.get('/', protect, wardenOnly, getAllFees);
router.put('/:id/pay', protect, wardenOnly, markPaid);

module.exports = router;