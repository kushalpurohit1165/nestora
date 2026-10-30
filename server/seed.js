require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");

const User = require("./models/User");
const Room = require("./models/Room");
const Fee = require("./models/Fee");
const Pricing = require("./models/Pricing");
const MessMenu = require("./models/MessMenu");
const Info = require("./models/Info");
const { deriveRoom } = require("./utils/roomHelper");

// ---------- 1) All 144 rooms: A101 to D312 ----------
const buildRooms = () => {
  const rooms = [];
  for (const block of ["A", "B", "C", "D"]) {
    for (const floor of [1, 2, 3]) {
      for (let n = 1; n <= 12; n++) {
        const roomNo = `${block}${floor}${String(n).padStart(2, "0")}`;
        rooms.push(deriveRoom(roomNo)); // block, floor, type, capacity, ac come from the number
      }
    }
  }
  return rooms;
};

// ---------- 2) Default pricing (placeholder amounts, the warden can edit) ----------
const pricing = {
  rents: {
    single_ac: 6000,
    single_nonac: 4500,
    double_ac: 4500,
    double_nonac: 3200,
    triple_ac: 3500,
    triple_nonac: 2500,
  },
  messCharge: 3000,
  securityDeposit: 10000,
};

// ---------- 3) Weekly mess menu ----------
const menu = [
  {
    day: "Monday",
    breakfast: "Poha, Tea",
    lunch: "Dal, Rice, Roti, Mixed Veg",
    snacks: "Samosa, Tea",
    dinner: "Paneer Curry, Roti, Rice",
  },
  {
    day: "Tuesday",
    breakfast: "Aloo Paratha, Curd",
    lunch: "Rajma, Rice, Roti, Salad",
    snacks: "Biscuits, Tea",
    dinner: "Mixed Dal, Roti, Jeera Rice",
  },
  {
    day: "Wednesday",
    breakfast: "Idli, Sambar",
    lunch: "Kadhi, Rice, Roti, Aloo Sabzi",
    snacks: "Bread Pakora, Tea",
    dinner: "Chole, Roti, Rice",
  },
  {
    day: "Thursday",
    breakfast: "Upma, Tea",
    lunch: "Dal Tadka, Rice, Roti, Bhindi",
    snacks: "Sandwich, Tea",
    dinner: "Egg Curry / Veg Kofta, Roti, Rice",
  },
  {
    day: "Friday",
    breakfast: "Puri Bhaji",
    lunch: "Dal Fry, Rice, Roti, Cabbage Sabzi",
    snacks: "Kachori, Tea",
    dinner: "Veg Pulao, Raita, Dal",
  },
  {
    day: "Saturday",
    breakfast: "Bread Butter, Jam, Tea",
    lunch: "Chana Dal, Rice, Roti, Lauki",
    snacks: "Maggi, Tea",
    dinner: "Paneer Butter Masala, Naan, Rice",
  },
  {
    day: "Sunday",
    breakfast: "Chole Bhature",
    lunch: "Special Thali, Sweet",
    snacks: "Pakora, Tea",
    dinner: "Dal Makhani, Roti, Rice, Kheer",
  },
];

// ---------- 4) Default rules ----------
const rule = (category, text, order) => ({
  kind: "rule",
  category,
  text,
  order,
});
const facility = (category, text, order) => ({
  kind: "facility",
  category,
  text,
  order,
});

const infos = [
  rule("General", "Carry your college ID card at all times.", 1),
  rule(
    "General",
    "Stay only in your allotted room. A room change needs the warden's written approval.",
    2,
  ),
  rule(
    "General",
    "Ragging is strictly prohibited and punishable under college and UGC rules.",
    3,
  ),
  rule("General", "Smoking, alcohol, drugs and gambling are not allowed.", 4),

  rule(
    "Timings",
    "The gate closes at 10:00 PM. Late entry needs prior permission.",
    5,
  ),
  rule("Timings", "Quiet hours are from 10:00 PM to 6:00 AM.", 6),

  rule(
    "Visitors",
    "Visitors are allowed only in the visitor area, from 10:00 AM to 6:00 PM, and must sign the register.",
    7,
  ),
  rule("Visitors", "No visitors in rooms and no overnight stay.", 8),

  rule(
    "Rooms and property",
    "Keep your room clean. The warden may inspect rooms at any time.",
    9,
  ),
  rule(
    "Rooms and property",
    "Heaters, induction cooktops and cooking appliances are not allowed.",
    10,
  ),
  rule(
    "Rooms and property",
    "Do not tamper with electrical or fire-safety equipment.",
    11,
  ),
  rule(
    "Rooms and property",
    "Damage to property is charged to the student or deducted from the deposit.",
    12,
  ),

  rule("Mess", "Eat in your assigned mess hall.", 13),
  rule("Mess", "Do not waste food or take food out of the mess hall.", 14),
  rule(
    "Mess",
    "Follow the meal timings: breakfast 7:30-9:30, lunch 12:30-2:30, snacks 5:00-6:00, dinner 7:30-9:30.",
    15,
  ),

  rule(
    "Fees",
    "Rent and mess fees are paid in advance between the 1st and 5th of each month.",
    16,
  ),
  rule(
    "Fees",
    "Payments after the 5th are marked Overdue and the student is warned.",
    17,
  ),
  rule(
    "Fees",
    "The security deposit is refunded when the student leaves, after room check and damage deductions.",
    18,
  ),

  rule(
    "Complaints and discipline",
    "Raise problems through the Nestora complaints page.",
    19,
  ),
  rule(
    "Complaints and discipline",
    "Repeated violations may lead to a warning, a fine or cancellation of the room.",
    20,
  ),

  facility("Connectivity", "Wi-Fi available in all blocks.", 21),
  facility("Utilities", "24x7 water supply.", 22),
  facility("Utilities", "Power backup for common areas and rooms.", 23),
  facility("Living", "Laundry area.", 24),
  facility("Living", "Common room with seating and TV.", 25),
  facility("Safety", "CCTV security in common areas.", 26),
  facility("Safety", "First-aid kit available with the warden.", 27),
  facility("Visitors", "Dedicated visitor area.", 28),
];

// ---------- Run everything ----------
const seed = async () => {
  await connectDB();

  // Clear what we are about to recreate (fees too, since they point to old rooms and students)
  await Promise.all([
    Room.deleteMany(),
    Fee.deleteMany(),
    Pricing.deleteMany(),
    MessMenu.deleteMany(),
    Info.deleteMany(),
    User.deleteMany({ role: "warden" }),
  ]);

  await Room.insertMany(buildRooms());
  await Pricing.create(pricing);
  await MessMenu.insertMany(menu);
  await Info.insertMany(infos);

  // Warden account with a hashed password
  const hashed = await bcrypt.hash("warden123", 10);
  await User.create({
    name: "Hostel Warden",
    email: "warden@nestora.com",
    password: hashed,
    phone: "9999999999",
    course: "",
    role: "warden",
  });

  console.log("Seed complete:");
  console.log(`  rooms: ${await Room.countDocuments()}`);
  console.log(`  pricing: ${await Pricing.countDocuments()}`);
  console.log(`  menu days: ${await MessMenu.countDocuments()}`);
  console.log(`  rules and facilities: ${await Info.countDocuments()}`);
  console.log("  warden: warden@nestora.com / warden123");

  await mongoose.disconnect();
};

seed().catch(async (err) => {
  console.error("Seed failed:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});
