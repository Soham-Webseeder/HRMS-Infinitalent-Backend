const mongoose = require("mongoose");

const resignationSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  resignationDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
  },
  image: {
    type: String, // URL to uploaded document
  },
  isResigned: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
});

module.exports = mongoose.model("Resignation", resignationSchema);
