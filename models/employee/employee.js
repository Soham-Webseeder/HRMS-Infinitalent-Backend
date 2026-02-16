const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  // --- AUTHENTICATION (Merged from User) ---
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "hr", "employee"],
    default: "employee",
  },
  otp: {
    type: String,
  },
  token: {
    type: String, // For password resets
  },
  resetPasswordExpires: {
    type: Date,
  },
  fcmToken: {
    type: String,
    default: null,
  },

  // --- BASIC INFO (Preserving Employee Field Names) ---
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  middleName: {
    type: String,
  },
  lastName: {
    type: String,
    trim: true,
  },
  phone: {
    type: String, // Using String to support various formats/leading zeros
  },
  alternativePhone: {
    type: String,
  },
  dateOfBirth: {
    type: String,
  },
  gender: {
    type: String,
  },
  maritalStatus: {
    type: String,
  },
  photograph: {
    type: String,
    default: "",
  },
  resume: { type: String }, 
  SSC: { type: String },    
  HSC: { type: String },

  // --- WORK & POSITION ---
  empId: {
    type: String,
  },
  designation: {
    type: String,
    default: "",
  },
  position: {
    type: String,
  },
  department: {
    type: String,
  },
  businessUnit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BussinessUnit",
  },
  employmentStatus: {
    type: String,
    enum: ["Active", "Terminated", "Resigned", "Notice Period"],
    default: "Active",
  },
  employeeType: {
    type: String,
    enum: ["ICPL", "ICPLOS", "ICPLNAPS"],
  },
  hireDate: {
    type: String,
  },
  originalHireDate: {
    type: String,
  },

  // --- FINANCIALS ---
  salary: {
    type: Number,
  },
  salarySetup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SalarySetup",
  },
  bankName: { type: String },
  branchName: { type: String },
  accountNo: { type: Number },
  acHolderName: { type: String },
  accountType: {
    type: String,
    enum: ["Saving", "Salary", "Current"],
  },
  ifscCode: { type: String },

  // --- COMPLIANCE & DOCS ---
  aadharCard: { type: String },
  panCard: { type: String },
  uanNo: { type: Number },
  esicNo: { type: Number },
  documents: {
    type: [
      {
        docName: { type: String, required: true },
        docDocument: { type: String, required: true },
      },
    ],
    default: [],
  },

  // --- SYSTEM & TRACKING ---
  isTrackingEnabled: {
    type: Boolean,
    default: true,
  },
  geofenceCenter: {
    type: [Number], // [longitude, latitude]
  },
  geofenceRadius: {
    type: Number, // in meters
  },
  active: {
    type: Boolean,
    default: true,
  },
  companyDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  }
}, { timestamps: true });

const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;