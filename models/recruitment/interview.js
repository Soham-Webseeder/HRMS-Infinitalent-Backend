const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  candidateName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
  },
  canName:{
    type:String
  },
  interviewDate: {
    type: String,
  },
  jobPositionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Position",
  },
  jobPosition:{
    type:String
  },

  interviewer: {
    type: String,
  },
  vivaMarks: {
    type: Number,
  },
  writtenMarks: {
    type: Number,
  },
  mcqMarks: {
    type: Number,
  },
  totalMarks: {
    type: Number,
  },
  recommandation: {
    type: String,
  },
  selection: {
    type: String,
    enum: ["Selected", "Deselected"],
  },
  details: {
    type: String,
  },
});

module.exports = mongoose.model("Interview", interviewSchema);
