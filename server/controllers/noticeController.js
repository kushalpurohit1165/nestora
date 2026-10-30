const Notice = require('../models/Notice');

// GET /api/notices  (logged in) - newest first, with the poster's name
const getNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find()
      .populate('postedBy', 'name') // replaces the id with the user's name
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, notices });
  } catch (err) {
    next(err);
  }
};

// POST /api/notices  (warden)
const createNotice = async (req, res, next) => {
  try {
    const { title, message } = req.body;
    const notice = await Notice.create({ title, message, postedBy: req.user._id });
    res.status(201).json({ success: true, message: 'Notice posted', notice });
  } catch (err) {
    next(err);
  }
};

// PUT /api/notices/:id  (warden)
const updateNotice = async (req, res, next) => {
  try {
    const { title, message } = req.body;
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { title, message },
      { new: true, runValidators: true }
    );
    if (!notice) {
      const error = new Error('Notice not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, message: 'Notice updated', notice });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/notices/:id  (warden)
const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      const error = new Error('Notice not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, message: 'Notice deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotices, createNotice, updateNotice, deleteNotice };