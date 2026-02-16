const mongoose = require("mongoose");

const selectionSchema = new mongoose.Schema({
  candidateName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
  },
  position: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Position",
  },
  selectionTerms: {
    type: String,
  },
});

module.exports = mongoose.model("Selection", selectionSchema);
