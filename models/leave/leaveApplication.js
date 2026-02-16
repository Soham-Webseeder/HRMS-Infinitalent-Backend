const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  employeeName: {
    type: String,
    default: '', // Default value
  },
  department: {
    type: String,
    default: '', // Default value
  },
  applicationStartDate: {
    type: String,
    default: '', // Default value
  },
  applyDay: {
    type: String,
    default: '', // Default value
  },
  approvedDay: {
    type: String,
    default: '', // Default value
  },
  reason: {
    type: String,
    default: '', // Default value
  },
  applicationEndDate: {
    type: String,
    default: '', // Default value
  },
  applicationHardCopy: {
    type: String,
    default: '', // Default value
  },
  leaveRequestDate: {
    type: String,
    default: '', // Default value
  },
  approvedBy: {
    type: mongoose.Types.ObjectId,
    ref: "Employee",
    default: null, // Default value
  },
  status: {
    type: String,
    default: 'Pending', // Default value
  },
  paidLeave: {
    type: Boolean,
    default: false, // Default value
  },
  leaveType: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"LeaveType"
  },
  leaveDuration: {
    type: String,
    enum: ["Half Day", "Full Day"],
    default: 'Full Day', // Default value
  },
  paidLeaveDays: {
    type: Number,
    default: 0, // Default value
  },
});

module.exports = mongoose.model("LeaveApplication", leaveApplicationSchema);
