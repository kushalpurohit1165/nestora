const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: [true, "Title is required"], trim: true },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  status: { type: String, enum: ["Pending", "Resolved"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

// Database optimization: index on status for filtering Pending vs Resolved
complaintSchema.index({ status: 1 });

module.exports = mongoose.model("Complaint", complaintSchema);
