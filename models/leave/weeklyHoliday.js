const mongoose = require("mongoose");

const weeklyHolidaySchema = new mongoose.Schema({
  monday: {
    type: Boolean,
    default: false,
  },
  tuesday: {
    type: Boolean,
    default: false,
  },
  wednesday: {
    type: Boolean,
    default: false,
  },
  thursday: {
    type: Boolean,
    default: false,
  },
  friday: {
    type: Boolean,
    default: false,
  },
  saturday: {
    type: Boolean,
    default: false,
  },
  sunday: {
    type: Boolean,
    default: false,
  },
});

weeklyHolidaySchema.methods.isHoliday = function (day) {
  return this[day] === true;
};


module.exports = mongoose.model("WeeklyHoliday", weeklyHolidaySchema);
