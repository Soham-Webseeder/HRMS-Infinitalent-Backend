const mongoose = require("mongoose");

const signatorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  image: { type: String }, // Base64 or URL for the signatory image
});
  
module.exports = mongoose.model("Signatory", signatorySchema);
