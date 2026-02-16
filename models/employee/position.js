const mongoose = require("mongoose");

const postionSchema = new mongoose.Schema({
  position: {
    type: String,
  },
  details: {
    type: String,
  },
});

module.exports = mongoose.model("Position", postionSchema);
