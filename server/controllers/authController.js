const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Creates a token that contains the user's id and role
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// POST /api/auth/register  (public, always creates a student)
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, course } = req.body;

    // Hash the password: we never store the plain password
    const hashed = await bcrypt.hash(password, 10);

    // role is NOT taken from req.body, so nobody can register as a warden
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      course,
      role: 'student',
    });

    res.status(201).json({
      success: true,
      message: 'Registered successfully',
      token: generateToken(user),
      role: user.role,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login  (public)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    // Same message for wrong email or wrong password (safer)
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: generateToken(user),
      role: user.role,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/profile  (logged in)
const getProfile = async (req, res) => {
  // protect middleware already put the user in req.user
  res.status(200).json({ success: true, user: req.user });
};

// PUT /api/auth/profile  (logged in) - update name, phone, course
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, course } = req.body;

    if (phone && !/^\d{10}$/.test(phone)) {
      const error = new Error('Phone must be exactly 10 digits');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, course },
      { new: true, runValidators: true } // new:true returns the updated document
    ).select('-password');

    res.status(200).json({ success: true, message: 'Profile updated', user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile, updateProfile };