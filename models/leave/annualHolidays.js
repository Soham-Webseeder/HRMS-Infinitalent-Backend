const mongoose = require("mongoose");

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function formatTime(date) {
  return date.toTimeString().split(" ")[0];
}

const HolidaySchema = new mongoose.Schema({
  date: { type: String, default: () => formatDate(new Date()) },
  event: { type: String, required: true },
  time: { type: String, default: () => formatTime(new Date()) },
});

module.exports = mongoose.model("annualHoliday", HolidaySchema);
