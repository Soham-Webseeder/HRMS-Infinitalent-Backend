const mongoose = require("mongoose");

const divisionSchema = new mongoose.Schema({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  divisionName: {
    type: String,
  },
});

module.exports = mongoose.model("Division", divisionSchema);
