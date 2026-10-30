const Fee = require('../models/Fee');
const Room = require('../models/Room');
const Pricing = require('../models/Pricing');

const makeError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// "Overdue" is COMPUTED: a Pending rent/mess fee is overdue after the 5th of its month.
// Deposits are never overdue.
const isOverdue = (fee) => {
  if (fee.status !== 'Pending' || fee.type === 'deposit' || !fee.month) return false;
  const [year, month] = fee.month.split('-').map(Number);
  const lastDay = new Date(year, month - 1, 5, 23, 59, 59); // end of the 5th
  return new Date() > lastDay;
};

const withOverdue = (fee) => ({ ...fee.toObject(), overdue: isOverdue(fee) });

// GET /api/fees/mine  (student)
const getMyFees = async (req, res, next) => {
  try {
    const fees = await Fee.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, fees: fees.map(withOverdue) });
  } catch (err) {
    next(err);
  }
};

// GET /api/fees  (warden) - all fees with the student's name
const getAllFees = async (req, res, next) => {
  try {
    const fees = await Fee.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, fees: fees.map(withOverdue) });
  } catch (err) {
    next(err);
  }
};

// POST /api/fees/generate  (warden) - body: { month: "2026-11" } (optional)
// Creates one rent fee and one mess fee for every student who has a room.
const generateFees = async (req, res, next) => {
  try {
    // Default to the current month
    let month = req.body.month;
    if (!month) {
      const now = new Date();
      month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      throw makeError('Month must look like 2026-11', 400);
    }

    const pricing = await Pricing.findOne();
    if (!pricing) throw makeError('Pricing not set up. Run the seed script', 400);

    const rooms = await Room.find({ 'occupants.0': { $exists: true } }); // rooms with 1+ students
    let created = 0;
    let skipped = 0;

    for (const room of rooms) {
      const rentKey = `${room.type}_${room.ac ? 'ac' : 'nonac'}`; // e.g. "double_ac"
      const rent = pricing.rents[rentKey];

      for (const studentId of room.occupants) {
        // Create the rent fee and the mess fee, skipping any that already exist
        const toCreate = [
          { type: 'rent', amount: rent },
          { type: 'mess', amount: pricing.messCharge },
        ];

        for (const item of toCreate) {
          const exists = await Fee.findOne({ user: studentId, type: item.type, month });
          if (exists) {
            skipped += 1;
          } else {
            await Fee.create({ user: studentId, type: item.type, month, amount: item.amount });
            created += 1;
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `Fees generated for ${month}: ${created} created, ${skipped} already existed`,
      created,
      skipped,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/fees/:id/pay  (warden) - marks a fee as Paid
const markPaid = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) throw makeError('Fee not found', 404);
    if (fee.status !== 'Pending') throw makeError(`Fee is already ${fee.status}`, 400);

    fee.status = 'Paid';
    fee.paidOn = new Date();
    await fee.save();

    res.status(200).json({ success: true, message: 'Fee marked as paid', fee });
  } catch (err) {
    next(err);
  }
};

// GET /api/fees/stats  (warden) - uses Mongoose aggregate()
const getFeeStats = async (req, res, next) => {
  try {
    // Group by status: how many fees and how much money in each
    const byStatus = await Fee.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Turn the array into a simple object, with 0 for missing statuses
    const result = {
      Paid: { count: 0, total: 0 },
      Pending: { count: 0, total: 0 },
      Refunded: { count: 0, total: 0 },
    };
    byStatus.forEach((row) => {
      result[row._id] = { count: row.count, total: row.total };
    });

    res.status(200).json({
      success: true,
      stats: {
        collected: result.Paid.total,
        pending: result.Pending.total,
        refunded: result.Refunded.total,
        counts: {
          paid: result.Paid.count,
          pending: result.Pending.count,
          refunded: result.Refunded.count,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyFees, getAllFees, generateFees, markPaid, getFeeStats };