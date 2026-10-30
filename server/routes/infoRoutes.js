const express = require('express');
const router = express.Router();
const { getInfo, createInfo, updateInfo, deleteInfo } = require('../controllers/infoController');
const { protect } = require('../middleware/auth');
const { wardenOnly } = require('../middleware/role');

router.get('/', getInfo);                                // public
router.post('/', protect, wardenOnly, createInfo);       // warden only
router.put('/:id', protect, wardenOnly, updateInfo);
router.delete('/:id', protect, wardenOnly, deleteInfo);

module.exports = router;