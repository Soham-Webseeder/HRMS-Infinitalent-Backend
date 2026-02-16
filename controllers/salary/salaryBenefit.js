const SalaryBenefit = require("../../models/salary/salaryBenefit");

// Create Salary Benefits
exports.createSalaryBenefits = async (req, res) => {
  try {
    const val = req.body;
    const salaryBenefit = await SalaryBenefit.create({ ...val });
    if (!salaryBenefit) {
      return res.status(404).json({
        success: false,
        message: "No Data Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: salaryBenefit,
      message: "salaryBenefit Created....",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Salary Benefits
exports.getAllSalaryBenefits = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const { name } = req.query;

    // Build the filter object
    let filter = {};
    if (name) {
      filter.benefitName = { $regex: name, $options: "i" }; // Case-insensitive search
    }

    // Fetch the salary benefits with the filter applied
    const salaryBenefit = await SalaryBenefit.find(filter).skip(skip).limit(limit);

    const totalSalaryBenefits = await SalaryBenefit.countDocuments(filter);
    const totalPages = Math.ceil(totalSalaryBenefits / limit);

    if (!salaryBenefit || salaryBenefit.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Data Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: salaryBenefit,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalSalaryBenefits: totalSalaryBenefits,
      },
      message: "Salary Benefits Fetched Successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Salary Benefit By Id
exports.getSalaryBenefitById = async (req, res) => {
  try {
    const salaryBenefitId = req.params.id;
    if (!salaryBenefitId) {
      return res.status(401).json({
        success: false,
        message: "Id is required for fetching Salary Benefit",
      });
    }
    const salaryBenefit = await SalaryBenefit.findById(salaryBenefitId);
    if (!salaryBenefit) {
      return res.status(404).json({
        success: false,
        message: "salaryBenefit Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: salaryBenefit,
      message: "salaryBenefit Fetched Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Salary Benefits
exports.updateSalaryBenefit = async (req, res) => {
  try {
    const salaryBenefitId = req.params.id;
    const data = req.body;
    if (!salaryBenefitId) {
      return res.status(401).json({
        success: false,
        message: "Id is required for updating Salary Benefits",
      });
    }
    const dataToBeUpdate = await SalaryBenefit.findByIdAndUpdate(
      salaryBenefitId,
      data,
      {
        new: true,
      }
    );
    if (!dataToBeUpdate) {
      return res.status(404).json({
        success: false,
        message: "Salary Benefits Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: dataToBeUpdate,
      message: "Salary Benefits Updated Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Salary Benefit
exports.deleteSalaryBenefit = async (req, res) => {
  try {
    const salaryBenefitId = req.params.id;
    if (!salaryBenefitId) {
      return res.status(401).json({
        success: false,
        message: "Id is required for deleting salaryBenefitId",
      });
    }
    const dataToBeDeleted = await SalaryBenefit.findByIdAndDelete(
      salaryBenefitId
    );
    if (!dataToBeDeleted) {
      return res.status(404).json({
        success: false,
        message: "Salary Benefit Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: dataToBeDeleted,
      message: "Salary Benefit Deleted Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
