const mongoose = require("mongoose");

const employeeRecruitmentSchema = new mongoose.Schema({
  serialNo: {
    type: Number,
  },
  date: {
    type: String,
  },
  from: {
    type: String,
  },
  to: {
    type: String,
    default: "HR Department",
  },
  jobDescription: [
    {
      Sno: {
        type: Number,
      },
      designation: {
        type: String,
      },

      purpose: {
        type: String,
      },
      NoOfEmployee: {
        type: Number,
      },
    },
  ],
  preparedBy: {
    type: String,
  },
  approvedBy: {
    type: String,
  },
});

module.exports = mongoose.model(
  "employeeRecruitment",
  employeeRecruitmentSchema
);
