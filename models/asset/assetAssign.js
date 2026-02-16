const mongoose = require("mongoose");

const assetAssignSchema = new mongoose.Schema({
  employeeName: {
    type: String,
  },
  fields: [
    {
      equipment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Equipment",
      },
      date: {
        type: Date,
      },
    },
  ],
  empId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"employee"
  }
});

module.exports = mongoose.model("AssetAssign", assetAssignSchema);
