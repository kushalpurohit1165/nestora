// Allows only wardens. Must be used AFTER protect, because it reads req.user.
const wardenOnly = (req, res, next) => {
  if (req.user && req.user.role === 'warden') {
    return next();
  }
  const error = new Error('Access denied. Warden only');
  error.statusCode = 403; // 403 = logged in, but not allowed
  next(error);
};

module.exports = { wardenOnly };