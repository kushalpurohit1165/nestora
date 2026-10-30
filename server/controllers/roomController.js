const Room = require('../models/Room');
const User = require('../models/User');
const Fee = require('../models/Fee');
const Pricing = require('../models/Pricing');
const { deriveRoom, getRoomStatus } = require('../utils/roomHelper');

const makeError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const OCCUPANT_FIELDS = 'name email phone course';

// Adds the computed status to a room before sending it
const withStatus = (room) => ({ ...room.toObject(), status: getRoomStatus(room) });

// GET /api/rooms  (warden) - all rooms with occupants filled in
const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().populate('occupants', OCCUPANT_FIELDS).sort({ roomNo: 1 });
    res.status(200).json({ success: true, rooms: rooms.map(withStatus) });
  } catch (err) {
    next(err);
  }
};

// GET /api/rooms/:id  (warden)
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('occupants', OCCUPANT_FIELDS);
    if (!room) throw makeError('Room not found', 404);
    res.status(200).json({ success: true, room: withStatus(room) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/rooms/:id  (warden) - maintenance on/off
const updateRoom = async (req, res, next) => {
  try {
    const { maintenance } = req.body;
    if (typeof maintenance !== 'boolean') {
      throw makeError('maintenance must be true or false', 400);
    }

    const room = await Room.findById(req.params.id);
    if (!room) throw makeError('Room not found', 404);

    room.maintenance = maintenance;
    await room.save();
    await room.populate('occupants', OCCUPANT_FIELDS);

    res.status(200).json({ success: true, message: 'Room updated', room: withStatus(room) });
  } catch (err) {
    next(err);
  }
};

// POST /api/rooms/:id/allot  (warden) - body: { studentId }
const allotStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    if (!studentId) throw makeError('studentId is required', 400);

    const room = await Room.findById(req.params.id);
    if (!room) throw makeError('Room not found', 404);
    if (room.maintenance) throw makeError('Room is under maintenance', 400);
    if (room.occupants.length >= room.capacity) throw makeError('Room is full', 400);

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') throw makeError('Student not found', 404);

    // A student cannot be in two rooms
    const alreadyIn = await Room.findOne({ occupants: studentId });
    if (alreadyIn) throw makeError(`Student is already in room ${alreadyIn.roomNo}`, 400);

    // Check pricing BEFORE changing anything, so a failure leaves no half-done state
    const activeDeposit = await Fee.findOne({
      user: studentId,
      type: 'deposit',
      status: { $in: ['Pending', 'Paid'] },
    });
    let pricing = null;
    if (!activeDeposit) {
      pricing = await Pricing.findOne();
      if (!pricing) throw makeError('Pricing not set up. Run the seed script', 400);
    }

    room.occupants.push(studentId);
    await room.save();

    // Create a Pending security deposit if the student has no active one
    if (!activeDeposit) {
      await Fee.create({ user: studentId, type: 'deposit', amount: pricing.securityDeposit });
    }

    await room.populate('occupants', OCCUPANT_FIELDS);
    res.status(200).json({ success: true, message: 'Student allotted', room: withStatus(room) });
  } catch (err) {
    next(err);
  }
};

// POST /api/rooms/:id/vacate  (warden) - body: { studentId }
const vacateStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    if (!studentId) throw makeError('studentId is required', 400);

    const room = await Room.findById(req.params.id);
    if (!room) throw makeError('Room not found', 404);

    const isInRoom = room.occupants.some((id) => id.toString() === studentId);
    if (!isInRoom) throw makeError('Student is not in this room', 400);

    room.occupants.pull(studentId); // remove the id from the array
    await room.save();

    // Deposit: a Paid deposit is Refunded; a never-paid (Pending) one is removed
    const deposit = await Fee.findOne({
      user: studentId,
      type: 'deposit',
      status: { $in: ['Pending', 'Paid'] },
    });
    if (deposit) {
      if (deposit.status === 'Paid') {
        deposit.status = 'Refunded';
        await deposit.save();
      } else {
        await deposit.deleteOne();
      }
    }

    await room.populate('occupants', OCCUPANT_FIELDS);
    res.status(200).json({ success: true, message: 'Student vacated', room: withStatus(room) });
  } catch (err) {
    next(err);
  }
};

// POST /api/rooms  (warden) - rooms normally come from the seed script
const createRoom = async (req, res, next) => {
  try {
    const roomNo = (req.body.roomNo || '').toUpperCase();
    const details = deriveRoom(roomNo);
    if (!details) throw makeError('Room number must be between A101 and D312', 400);

    const room = await Room.create(details);
    res.status(201).json({ success: true, message: 'Room created', room });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/rooms/:id  (warden)
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) throw makeError('Room not found', 404);
    if (room.occupants.length > 0) throw makeError('Cannot delete a room with students', 400);

    await room.deleteOne();
    res.status(200).json({ success: true, message: 'Room deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/rooms/stats  (warden) - uses Mongoose aggregate()
const getRoomStats = async (req, res, next) => {
  try {
    // Shared first stages: count occupants, compute status and free beds
    const base = [
      { $addFields: { occupied: { $size: '$occupants' } } },
      {
        $addFields: {
          status: {
            $switch: {
              branches: [
                { case: '$maintenance', then: 'Maintenance' },
                { case: { $eq: ['$occupied', 0] }, then: 'Vacant' },
                { case: { $gte: ['$occupied', '$capacity'] }, then: 'Full' },
              ],
              default: 'Partially filled',
            },
          },
          // beds in rooms under maintenance are not counted as vacant
          freeBeds: {
            $cond: ['$maintenance', 0, { $subtract: ['$capacity', '$occupied'] }],
          },
        },
      },
    ];

    // Helper: add 1 when the room's status matches
    const countIf = (name) => ({ $sum: { $cond: [{ $eq: ['$status', name] }, 1, 0] } });

    // 1) Per block and per floor
    const byFloor = Room.aggregate([
      ...base,
      {
        $group: {
          _id: { block: '$block', floor: '$floor' },
          vacantRooms: countIf('Vacant'),
          partialRooms: countIf('Partially filled'),
          fullRooms: countIf('Full'),
          maintenanceRooms: countIf('Maintenance'),
          vacantBeds: { $sum: '$freeBeds' },
        },
      },
      { $sort: { '_id.block': 1, '_id.floor': 1 } },
    ]);

    // 2) Per room type and AC / non-AC
    const byType = Room.aggregate([
      ...base,
      {
        $group: {
          _id: { type: '$type', ac: '$ac' },
          rooms: { $sum: 1 },
          totalBeds: { $sum: '$capacity' },
          occupiedBeds: { $sum: '$occupied' },
        },
      },
      { $sort: { '_id.type': 1, '_id.ac': -1 } },
    ]);

    // 3) Overall totals
    const totals = Room.aggregate([
      ...base,
      {
        $group: {
          _id: null,
          totalRooms: { $sum: 1 },
          totalBeds: { $sum: '$capacity' },
          occupiedBeds: { $sum: '$occupied' },
          vacantRooms: countIf('Vacant'),
          partialRooms: countIf('Partially filled'),
          fullRooms: countIf('Full'),
          maintenanceRooms: countIf('Maintenance'),
        },
      },
    ]);

    const [floorStats, typeStats, totalStats] = await Promise.all([byFloor, byType, totals]);

    res.status(200).json({
      success: true,
      stats: { byFloor: floorStats, byType: typeStats, totals: totalStats[0] || {} },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRooms, getRoomById, updateRoom, allotStudent,
  vacateStudent, createRoom, deleteRoom, getRoomStats,
};