const mongoose = require("mongoose");

const designationSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  name: {
    type: String,
  },
});

module.exports = mongoose.model("Designation", designationSchema);
