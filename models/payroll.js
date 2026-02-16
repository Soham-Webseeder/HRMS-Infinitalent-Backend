const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
    // Links directly to the unified Employee model
    employeeName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee", // Capitalized to match standard naming
        required: true,
    },
    amountCredited: {
        type: Number,
        required: true,
        min: 0
    },
    totalWorkDays: {
        type: Number,
        required: true
    },
    presentDays: {
        type: Number,
        required: true
    },
    absentDays: {
        type: Number,
        required: true
    },
    grossPay: {
        type: Number,
        required: true
    },
    totalPaidLeaves: {
        type: Number,
        default: 0
    },
    month: {
        type: Number,
        required: true // Usually critical for payroll lookups
    },
    year: {
        type: Number,
        required: true
    },
    tds: {
        type: Number,
        required: true
    },
    totalDeductions: {
        type: Number,
        required: true
    },
    dataGenerationDate: {
        type: String,
        required: true
    },
    payslipGenerationDate: {
        type: String,
        required: true
    },
    manualTDS: {
        type: Number,
        default: 0
    },
    source: {
        type: String,
        required: true
    },
    dataCreatedBy: {
        type: String,
        required: true
    },
    // UPDATED: Changed ref from "User" to "Employee"
    payslipGeneratedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    lopCreatedDate: {
        type: String,
        required: true
    },
    lopUpdatedDate: {
        type: String
    },
    lopCreatedBy: {
        type: String,
        required: true
    },
    lopUpdatedBy: {
        type: String
    },
    lopDays: {
        type: String // Consider changing to Number if you perform math on this
    },
    pfEmployee: { type: Number, required: true },
    pfEmployer: { type: Number, required: true },
    esicEmployee: { type: Number, required: true },
    esicEmployer: { type: Number, required: true },
    pt: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    hra: { type: Number, required: true },
    da: { type: Number, required: true },
    specialAllowance: { type: Number, required: true },
    otherAllowance: { type: Number, required: true },
    netSalary: {
        type: Number,
        required: true,
    },
    salaryType: {
        type: String,
        enum: ["PFESI", "NAPS Stipend", "CTC Payroll"]
    },
    extraPay: {
        type: Number,
        default: 0
    },
    extraDeductions: {
        type: Number,
        default: 0
    },
    extraDeductionsReason: {
        type: String,
        default: ""
    },
    extraPayReason: {
        type: String,
        default: ""
    },
    cycleStartDate: {
        type: String,
        default: ""
    },
    cycleEndDate: {
        type: String,
        default: ""
    },
}, { timestamps: true });

payrollSchema.index({ employeeName: 1, year: -1, month: -1 });

module.exports = mongoose.model("Payroll", payrollSchema);