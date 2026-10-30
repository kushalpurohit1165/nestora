const ROOM_REGEX = /^[A-D][1-3](0[1-9]|1[0-2])$/;

const CAPACITY = { single: 1, double: 2, triple: 3 };

// Works out block, floor, type, capacity and AC from the room number alone.
// Example: "C210" -> block C, floor 2, number 10 -> triple, non-AC
const deriveRoom = (roomNo) => {
  if (!ROOM_REGEX.test(roomNo)) return null;

  const block = roomNo[0];
  const floor = Number(roomNo[1]);
  const n = Number(roomNo.slice(2)); // 01-12

  let type = 'triple';
  if (n <= 4) type = 'single';
  else if (n <= 8) type = 'double';

  return {
    roomNo,
    block,
    floor,
    type,
    capacity: CAPACITY[type],
    ac: block === 'A' || block === 'B', // A and B are AC
  };
};

// Status is COMPUTED, never stored
const getRoomStatus = (room) => {
  if (room.maintenance) return 'Maintenance';
  if (room.occupants.length === 0) return 'Vacant';
  if (room.occupants.length >= room.capacity) return 'Full';
  return 'Partially filled';
};

module.exports = { ROOM_REGEX, deriveRoom, getRoomStatus };