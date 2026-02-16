const mongoose = require("mongoose");

const EmployeeChangeRequestSchema = new mongoose.Schema({
  employeeName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee", 
    required: true,
  },
  changes: {

    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    gender: String,
    dateOfBirth: String,
    country: String,
    photograph: String,
    resume: String,
    aadharCard: String,
    panCard: String,
    SSC: String,
    HSC: String,
    documents: {
      type: [
        {
          docName: { type: String, required: true },
          docDocument: { type: String, required: true },
        },
      ],
      default: [], 
    },
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
}, { timestamps: true }); // Highly recommended for tracking request dates

module.exports = mongoose.model(
  "EmployeeChangeRequest",
  EmployeeChangeRequestSchema
);