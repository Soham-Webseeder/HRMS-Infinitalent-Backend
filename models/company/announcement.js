const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  para: {
    type: String,
  },
  // Add other fields if needed
});

module.exports = mongoose.model("Announcement", announcementSchema);
