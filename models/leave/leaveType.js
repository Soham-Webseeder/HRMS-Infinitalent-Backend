const mongoose = require("mongoose");

const leaveTypeSchema = new mongoose.Schema({
  leaveType: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("LeaveType", leaveTypeSchema);
