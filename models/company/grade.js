const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  gradeName: {
    type: String,
  },
});

module.exports = mongoose.model("Grade", gradeSchema);
