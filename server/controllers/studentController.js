const User = require('../models/User');

// GET /api/students  (warden) - used for the "Allot student" dropdown
const getStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password') // never send password hashes
      .sort({ name: 1 });
    res.status(200).json({ success: true, students });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStudents };