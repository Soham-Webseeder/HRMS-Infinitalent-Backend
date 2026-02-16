const mongoose = require("mongoose");

const shortlistSchema = new mongoose.Schema({
  candidateName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
  },
  jobPosition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Position",
  },
  shortlistDate: {
    type: String,
  },
  interviewDate: {
    type: String,
  },
});

module.exports = mongoose.model("Shortlist", shortlistSchema);
