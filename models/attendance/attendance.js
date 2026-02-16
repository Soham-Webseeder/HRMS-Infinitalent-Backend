const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employeeName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  date:{
    type:String
  },
  status:{
    type:String,
    default:'Present'
  },
  attendanceStatus:{
    type:String
  },
  inTime:{
    type:String
  },
  outTime:{
    type:String
  },
  breakDuration:{
    type:String
  },
  lateBy:{
    type:String
  },
  earlyBy:{
    type:String
  },
  overTime:{
    type:String
  },
  workingHours:{
    type:String

  }
});

module.exports = mongoose.model("Attendance", attendanceSchema);
