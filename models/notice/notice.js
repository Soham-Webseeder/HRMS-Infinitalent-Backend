const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  noticeType: {
    type: String,
  },
  description: {
    type: String,
  },
  noticeDate: {
    type: String,
  },
  attachmentImage: {
    type: String,
  },
  noticeBy: {
    type: String,
  },
});

module.exports = mongoose.model("Notice", noticeSchema);
