const express = require('express');
const router = express.Router();
const {
  getNotices, createNotice, updateNotice, deleteNotice,
} = require('../controllers/noticeController');
const { protect } = require('../middleware/auth');
const { wardenOnly } = require('../middleware/role');

router.get('/', protect, getNotices);                    // any logged-in user
router.post('/', protect, wardenOnly, createNotice);     // warden only
router.put('/:id', protect, wardenOnly, updateNotice);
router.delete('/:id', protect, wardenOnly, deleteNotice);

module.exports = router;