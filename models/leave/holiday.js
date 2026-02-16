const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema({
  holidayName: {
    type: String,
  },
  from: {
    type: String,
  },
  to: {
    type: String,
  },
  numberOfDays: {
    type: Number,
  },
});

module.exports = mongoose.model("Holiday", holidaySchema);
