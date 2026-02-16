const mongoose = require("mongoose");
const moment = require("moment");
const performaceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    empId:{
      type:Number
    },
    employeeName: {
      type: String
    },
    date: {
      type: String,
    },
    note: {
      type: String,
    },
    numberOfStar: {
      type: Number,
    },
    year: {
      type: String,
    },
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

module.exports = mongoose.model("EmployeePerformance", performaceSchema);
