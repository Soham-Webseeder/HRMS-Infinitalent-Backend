const mongoose = require("mongoose");

const BussinessUnitSchema = new mongoose.Schema({
  employees: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  name: {
    type: String,
  },
});

module.exports = mongoose.model("BussinessUnit", BussinessUnitSchema);
