const express = require('express');
const router = express.Router();
const {
  getMyComplaints, createComplaint, updateComplaint,
  deleteComplaint, getAllComplaints, updateComplaintStatus,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');
const { wardenOnly } = require('../middleware/role');
const { validateComplaint } = require('../middleware/validate');

// Student routes (/mine must come before /:id so "mine" is not read as an id)
router.get('/mine', protect, getMyComplaints);
router.post('/', protect, validateComplaint, createComplaint);
router.put('/:id', protect, updateComplaint);
router.delete('/:id', protect, deleteComplaint);

// Warden routes
router.get('/', protect, wardenOnly, getAllComplaints);
router.put('/:id/status', protect, wardenOnly, updateComplaintStatus);

module.exports = router;