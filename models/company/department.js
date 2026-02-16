const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  department: {
    title: {
      type: String,
    },
  },
  division: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division",
    },
  ],
});

module.exports = mongoose.model("Department", departmentSchema);
