const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protects a route: only logged-in users (with a valid token) can pass.
// The frontend sends the token in the header:  Authorization: Bearer <token>
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      const error = new Error('Not logged in. Token missing');
      error.statusCode = 401;
      throw error;
    }

    const token = header.split(' ')[1];

    // verify() checks the signature and expiry; it throws if the token is bad
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user from the id stored inside the token (hide the password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      const error = new Error('User no longer exists');
      error.statusCode = 401;
      throw error;
    }

    req.user = user; // later middleware and controllers can use req.user
    next();
  } catch (err) {
    next(err); // goes to the central error handler
  }
};

module.exports = { protect };