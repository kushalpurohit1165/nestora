const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

// Public routes (validation runs first, then the controller)
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes (protect runs first)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;