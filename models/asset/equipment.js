const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({
  equipmentName: {
    type: String,
  },
  typeName: {
    type: String,
    ref: "AssetType",
  },
  model: {
    type: String,
  },
  prpductSerialNo: {
    type: Number,
  },
  specification:{
    type:String
  }
  // employee: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'employee' 
  // }
});

module.exports = mongoose.model("Equipment", equipmentSchema);
