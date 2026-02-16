const mongoose = require("mongoose");
const moment = require('moment')

const salarySetupSchema = new mongoose.Schema({
  employeeName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  salaryType: {
    type: String,
    enum: ["Salary", "Hourly"],
    default: "Salary"
  },
  grossSalary: {
    type: Number,
    required: true,
  },
  basicSalary: {
    type: Number,
    required: true,
  },
  hra: {
    type: Number,
    required: true,
  },
  da: {
    type: Number,
    required: true,
  },
  specialAllowance: {
    type: Number,
    required: true,
  },
  otherAllowance: {
    type: Number,
    required: true,
  },
  totalDeductions: {
    type: Number,
    required: true,
  },
  netSalary: {
    type: Number,
    required: true,
  },
  pfEmployee: {
    type: Number,
    required: true,
  },
  pfEmployer: {
    type: Number,
    required: true,
  },
  esicEmployee: {
    type: Number,
    required: true,
  },
  esicEmployer: {
    type: Number,
    required: true,
  },
  pt: {
    type: Number,
    required: true,
  },
  annualSalary:{
    type:Number
  }
},
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.createdAt = moment(ret.createdAt).format("DD MMM YYYY");
        ret.updatedAt = moment(ret.updatedAt).format("DD MMM YYYY");
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("SalarySetup", salarySetupSchema);