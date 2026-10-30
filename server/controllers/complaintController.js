const Complaint = require('../models/Complaint');

// Small helper to create an error with a status code
const makeError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// GET /api/complaints/mine  (student) - only my own complaints
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, complaints });
  } catch (err) {
    next(err);
  }
};

// POST /api/complaints  (student)
const createComplaint = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const complaint = await Complaint.create({ user: req.user._id, title, description });
    res.status(201).json({ success: true, message: 'Complaint raised', complaint });
  } catch (err) {
    next(err);
  }
};

// PUT /api/complaints/:id  (student, own only)
const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw makeError('Complaint not found', 404);

    // A student can only edit their own complaint
    if (complaint.user.toString() !== req.user._id.toString()) {
      throw makeError('You can only edit your own complaints', 403);
    }
    if (complaint.status === 'Resolved') {
      throw makeError('A resolved complaint cannot be edited', 400);
    }

    complaint.title = req.body.title || complaint.title;
    complaint.description = req.body.description || complaint.description;
    await complaint.save();

    res.status(200).json({ success: true, message: 'Complaint updated', complaint });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/complaints/:id  (student, own only)
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw makeError('Complaint not found', 404);

    if (complaint.user.toString() !== req.user._id.toString()) {
      throw makeError('You can only delete your own complaints', 403);
    }

    await complaint.deleteOne();
    res.status(200).json({ success: true, message: 'Complaint deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/complaints  (warden) - all complaints with the student's details
const getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'name email phone') // replaces the user id with these fields
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, complaints });
  } catch (err) {
    next(err);
  }
};

// PUT /api/complaints/:id/status  (warden) - Pending or Resolved
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Resolved'].includes(status)) {
      throw makeError('Status must be Pending or Resolved', 400);
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!complaint) throw makeError('Complaint not found', 404);

    res.status(200).json({ success: true, message: 'Status updated', complaint });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyComplaints,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  getAllComplaints,
  updateComplaintStatus,
};