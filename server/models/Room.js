const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  // Room number like A101 to D312 (block letter + floor digit + 01-12)
  roomNo: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true,
    match: [/^[A-D][1-3](0[1-9]|1[0-2])$/, 'Room number must be between A101 and D312'],
  },
  block: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  floor: { type: Number, enum: [1, 2, 3], required: true },
  type: { type: String, enum: ['single', 'double', 'triple'], required: true },
  ac: { type: Boolean, required: true },
  capacity: { type: Number, min: 1, max: 3, required: true },
  maintenance: { type: Boolean, default: false },

  // Relation: an array of user ids. populate() will replace these ids with full user data
  occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

// Database optimization: index on the fields the room grid filters by most
roomSchema.index({ block: 1, floor: 1 });

module.exports = mongoose.model('Room', roomSchema);