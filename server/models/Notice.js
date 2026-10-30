const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true },
  message: { type: String, required: [true, 'Message is required'], trim: true },
  // Relation: the warden who posted it
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notice', noticeSchema);