const mongoose = require('mongoose');

const lopSchema = new mongoose.Schema({
  employeeName: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  annualPackage: { type: Number },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  lopDays: { type: Number, required: true }, // Store the number of LOP days
  leaves: { type: Number }, // New field: Stores the number of approved or paid leaves
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdDate: { type: Date, default: Date.now },
  salarySlip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payroll'
  }
});

module.exports = mongoose.model('LOP', lopSchema);