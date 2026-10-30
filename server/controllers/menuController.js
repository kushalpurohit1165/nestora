const MessMenu = require('../models/MessMenu');

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// GET /api/menu  (public) - returns all 7 days in order
const getMenu = async (req, res, next) => {
  try {
    const menu = await MessMenu.find();
    menu.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
    res.status(200).json({ success: true, menu });
  } catch (err) {
    next(err);
  }
};

// PUT /api/menu/:day  (warden)
const updateMenuDay = async (req, res, next) => {
  try {
    const { breakfast, lunch, snacks, dinner } = req.body;

    const menu = await MessMenu.findOneAndUpdate(
      { day: req.params.day },
      { breakfast, lunch, snacks, dinner },
      { new: true, runValidators: true }
    );

    if (!menu) {
      const error = new Error('Day not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, message: 'Menu updated', menu });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMenu, updateMenuDay };