const EmployeeRecruitment = require("../../models/recruitment/employeeRecruitment");

// Create EmployeeRecruitment
exports.createEmployeeRecruitment = async (req, res) => {
  try {
    const data = req.body;
    const employeeRecruitment = await EmployeeRecruitment.create({ ...data });
    return res.status(200).json({
      success: true,
      data: employeeRecruitment,
      message: "Employee Recruitment Created Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All EmployeeRecruitments
exports.getAllEmployeeRecruitments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    const { name } = req.query;

    // Build the filter object
    let filter = {};
    if (name) {
      filter.recruitmentName = { $regex: name, $options: "i" }; // Case-insensitive search on recruitmentName
    }

    const employeeRecruitments = await EmployeeRecruitment.find(filter)
      .skip(skip)
      .limit(limit);

    const totalRecruitments = await EmployeeRecruitment.countDocuments(filter);
    const totalPages = Math.ceil(totalRecruitments / limit);

    if (!employeeRecruitments.length) {
      return res.status(404).json({
        success: false,
        message: "No Employee Recruitment Found...",
      });
    }

    return res.status(200).json({
      success: true,
      data: employeeRecruitments,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalRecruitments: totalRecruitments,
      },
      message: "Employee Recruitments Fetched Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get EmployeeRecruitment By Id
exports.getEmployeeRecruitmentById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Employee Recruitment Id is required for fetching...",
      });
    }
    const employeeRecruitment = await EmployeeRecruitment.findById(id);
    if (!employeeRecruitment) {
      return res.status(404).json({
        success: false,
        message: "Employee Recruitment Not Found...",
      });
    }
    return res.status(200).json({
      success: true,
      data: employeeRecruitment,
      message: "Employee Recruitment Fetched Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update EmployeeRecruitment
exports.updateEmployeeRecruitment = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Employee Recruitment Id is required for updating...",
      });
    }
    const updatedData = await EmployeeRecruitment.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updatedData) {
      return res.status(404).json({
        success: false,
        message: "Employee Recruitment Not Found...",
      });
    }
    return res.status(200).json({
      success: true,
      data: updatedData,
      message: "Employee Recruitment Updated Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete EmployeeRecruitment
exports.deleteEmployeeRecruitment = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Id is required for deleting Employee Recruitment...",
      });
    }
    const deleteData = await EmployeeRecruitment.findByIdAndDelete(id);
    if (!deleteData) {
      return res.status(404).json({
        success: false,
        message: "Employee Recruitment Not Found...",
      });
    }
    return res.status(200).json({
      success: true,
      data: deleteData,
      message: "Employee Recruitment Deleted Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
