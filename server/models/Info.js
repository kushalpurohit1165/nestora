const mongoose = require("mongoose");

// Rules and facilities share one collection; "kind" tells them apart
const infoSchema = new mongoose.Schema({
  kind: { type: String, enum: ["rule", "facility"], required: true },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
  },
  text: { type: String, required: [true, "Text is required"], trim: true },
  order: { type: Number, default: 0 }, // controls the display order
});

module.exports = mongoose.model("Info", infoSchema);
