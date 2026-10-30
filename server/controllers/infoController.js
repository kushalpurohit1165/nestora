const Info = require('../models/Info');

// GET /api/info  (public) - rules and facilities
const getInfo = async (req, res, next) => {
  try {
    const items = await Info.find().sort({ order: 1 });
    res.status(200).json({ success: true, items });
  } catch (err) {
    next(err);
  }
};

// POST /api/info  (warden)
const createInfo = async (req, res, next) => {
  try {
    const { kind, category, text, order } = req.body;
    const item = await Info.create({ kind, category, text, order });
    res.status(201).json({ success: true, message: 'Added', item });
  } catch (err) {
    next(err);
  }
};

// PUT /api/info/:id  (warden)
const updateInfo = async (req, res, next) => {
  try {
    const { kind, category, text, order } = req.body;
    const item = await Info.findByIdAndUpdate(
      req.params.id,
      { kind, category, text, order },
      { new: true, runValidators: true }
    );
    if (!item) {
      const error = new Error('Item not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, message: 'Updated', item });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/info/:id  (warden)
const deleteInfo = async (req, res, next) => {
  try {
    const item = await Info.findByIdAndDelete(req.params.id);
    if (!item) {
      const error = new Error('Item not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getInfo, createInfo, updateInfo, deleteInfo };