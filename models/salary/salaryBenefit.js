const mongoose = require("mongoose");

const salaryBenefitSchema = new mongoose.Schema({
  salaryBenefit: {
    type: String,
  },
  benefitsType: {
    type: String,
    enum: ["Add", "Deduct"],
  },
});

module.exports = mongoose.model("SalaryBenefit", salaryBenefitSchema);
