const express = require('express');
const router = express.Router();
const { getMenu, updateMenuDay } = require('../controllers/menuController');
const { protect } = require('../middleware/auth');
const { wardenOnly } = require('../middleware/role');

router.get('/', getMenu);                                // public
router.put('/:day', protect, wardenOnly, updateMenuDay); // warden only

module.exports = router;