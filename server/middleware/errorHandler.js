// Handles any URL that no route matched -> 404
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error); // send it to the central error handler below
};

// Custom middleware #2: centralized error handler.
// Express knows it is an error handler because it has 4 parameters (err, req, res, next).
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';

  // Mongoose validation failed (required field missing, wrong format, etc.)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Duplicate value in a unique field (for example the same email twice)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Invalid MongoDB id in the URL
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid id format';
  }

  // JWT problems
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token, please log in again';
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = { notFound, errorHandler };