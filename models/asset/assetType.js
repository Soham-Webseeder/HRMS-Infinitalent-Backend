const mongoose = require("mongoose");

const assetTypeSchema = new mongoose.Schema({
  typeName: {
    type: String,
  },
});

module.exports = mongoose.model("AssetType", assetTypeSchema);
