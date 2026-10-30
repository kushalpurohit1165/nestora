const express = require('express');
const router = express.Router();
const { getStudents } = require('../controllers/studentController');
const { protect } = require('../middleware/auth');
const { wardenOnly } = require('../middleware/role');

router.get('/', protect, wardenOnly, getStudents);

module.exports = router;