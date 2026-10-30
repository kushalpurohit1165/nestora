// Input validation middleware. Each function checks req.body and stops bad data
// before it reaches the controller.

const fail = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

// Registration: name, valid email, password 6+, phone 10 digits
const validateRegister = (req, res, next) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return next(fail("Name, email, password and phone are required"));
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return next(fail("Please enter a valid email"));
  }
  if (password.length < 6) {
    return next(fail("Password must be at least 6 characters"));
  }
  if (!/^\d{10}$/.test(phone)) {
    return next(fail("Phone must be exactly 10 digits"));
  }
  next();
};

// Login: email and password must be present
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(fail("Email and password are required"));
  }
  next();
};

// Complaint: title and description must be present
const validateComplaint = (req, res, next) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return next(fail("Title and description are required"));
  }
  next();
};

module.exports = { validateRegister, validateLogin, validateComplaint };
