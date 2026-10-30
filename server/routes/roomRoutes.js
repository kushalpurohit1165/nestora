const express = require('express');
const router = express.Router();
const {
  getRooms, getRoomById, updateRoom, allotStudent,
  vacateStudent, createRoom, deleteRoom, getRoomStats,
} = require('../controllers/roomController');
const { protect } = require('../middleware/auth');
const { wardenOnly } = require('../middleware/role');

// Every room route is warden only
router.use(protect, wardenOnly);

router.get('/stats', getRoomStats);   // must come BEFORE /:id, or "stats" is read as an id
router.get('/', getRooms);
router.post('/', createRoom);
router.get('/:id', getRoomById);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);
router.post('/:id/allot', allotStudent);
router.post('/:id/vacate', vacateStudent);

module.exports = router;