const SalarySetup = require("../../models/salary/salarySetup");
const Employee = require('../../models/employee/employee');
const position = require("../../models/employee/position");

// Create Salary Setup
exports.createSalarySetup = async (req, res) => {
  try {
    const val = req.body;
    const employee = await Employee.findById(val.employeeName);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const annualGrossSalary = val.basicSalary + val.medical + val.specialAllowance + val.conveyanceAllowance + val.otherAllowance + val.hra;

    const salarySetup = await SalarySetup.create({
      employeeName: val.employeeName,
      income: {
        annual: {
          basicSalary: val.basicSalary,
          medical: val.medical,
          specialAllowance: val.specialAllowance,
          conveyanceAllowance: val.conveyanceAllowance,
          otherAllowance: val.otherAllowance,
          hra: val.hra
        },
        monthly: {
          basicSalary: val.basicSalary / 12,
          medical: val.medical / 12,
          specialAllowance: val.specialAllowance / 12,
          conveyanceAllowance: val.conveyanceAllowance / 12,
          otherAllowance: val.otherAllowance / 12,
          hra: val.hra / 12
        }
      },
      deduction: {
        annual: {
          pf: (val.basicSalary * 12) / 100,
        },
        monthly: {
          pf: ((val.basicSalary) / 100),
        },
      },
      grossSalary: {
        annual: annualGrossSalary,
        monthly: annualGrossSalary / 12,
      },
      netSalary: {
        annual: annualGrossSalary - (val.basicSalary * 12) / 100,
        monthly: annualGrossSalary / 12 - ((val.basicSalary) / 100),
      }
    });

    employee.salarySetup = await salarySetup._id;
    await employee.save();

    await salarySetup.populate("employeeName", "firstName lastName department position")

    if (!salarySetup) {
      return res.status(404).json({
        success: false,
        message: "No Data Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: salarySetup,
      message: "Salary Setup Created....",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Salary Setup With pagination
exports.getAllSalarySetup = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const { name } = req.query;

    // Build the filter object
    let filter = {};
    if (name) {
      filter.name = { $regex: name, $options: "i" }; // Case-insensitive search
    }

    // Fetch the salary setups with the filter applied
    const salarySetup = await SalarySetup.find(filter).skip(skip).limit(limit).populate("employeeName", "firstName lastName department position");

    const totalSalarySetups = await SalarySetup.countDocuments(filter);
    const totalPages = Math.ceil(totalSalarySetups / limit);

    if (!salarySetup || salarySetup.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Data Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: salarySetup,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalSalarySetups: totalSalarySetups,
      },
      message: "Salary Setup Fetched Successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Salary Setup
exports.getSalarySetups = async (req, res) => {
  const data = await SalarySetup.find({}).populate("employeeName", "firstName lastName department position");
  if (!data) {
    return res.status(404).json({
      success: false,
      message: "No Data Found",
    });
  }
  return res.status(200).json({
    success: true,
    data: data,
    message: "salary Setup Fetched Successfully.....",
  });
}

// Get Salary SetUp By Id
exports.getSalarySetupById = async (req, res) => {
  try {
    const salarySetupId = req.params.id;
    if (!salarySetupId) {
      return res.status(401).json({
        success: false,
        message: "Id is required for fetching Salary Setup",
      });
    }
    const salarySetup = await SalarySetup.findById(salarySetupId).populate("employeeName", "firstName lastName department position");
    if (!salarySetup) {
      return res.status(404).json({
        success: false,
        message: "Salary Setup Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: salarySetup,
      message: "Salary Setup Fetched Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSalarySetupByEmployeeName = async (req, res) => {
  try {
    const employeeName = req.params.id;
    if (!employeeName) {
      return res.status(400).json({
        success: false,
        message: "Employee name is required for fetching Salary Setup",
      });
    }

    const salarySetup = await SalarySetup.findOne({ employeeName }).populate("employeeName", "firstName lastName department position");
    if (!salarySetup) {
      return res.status(404).json({
        success: false,
        message: "Salary Setup Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: salarySetup,
      message: "Salary Setup Fetched Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Salary Setup
exports.updateSalarySetup = async (req, res) => {
  try {
    const salarySetupId = req.params.id;
    const data = req.body;
    if (!salarySetupId) {
      return res.status(401).json({
        success: false,
        message: "Id is required for updating Salary Setup",
      });
    }
    const dataToBeUpdate = await SalarySetup.findByIdAndUpdate(
      salarySetupId,
      data,
      {
        new: true,
      }
    );
    if (!dataToBeUpdate) {
      return res.status(404).json({
        success: false,
        message: "Salary Setup Not Found",
      });
    }

    await dataToBeUpdate.populate("employeeName", "firstName lastName department position")
    return res.status(200).json({
      success: true,
      data: dataToBeUpdate,
      message: "Salary Setup Updated Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Salary Setup
exports.deleteSalarySetup = async (req, res) => {
  try {
    const salarySetupId = req.params.id;
    if (!salarySetupId) {
      return res.status(401).json({
        success: false,
        message: "Id is required for deleting salarySetup",
      });
    }
    const dataToBeDeleted = await SalarySetup.findByIdAndDelete(salarySetupId);
    if (!dataToBeDeleted) {
      return res.status(404).json({
        success: false,
        message: "Salary Setup Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: dataToBeDeleted,
      message: "Salary Setup Deleted Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSalaryHistory = async (req, res) => {
  try {
    const salaryHistories = await SalarySetup.find()
      .populate('employeeName', 'empName') // Populate employee details
      .exec();

    // Format the data
    const formattedHistories = salaryHistories.map((history) => ({
      sNo: history._id,
      employeeName: history.employeeName.empName,
      totalSalary: history.grossSalary,
      leaveDays: history.leaveDays || 0, // If you add leaveDays to the schema
      workingDays: history.workingDays || 0, // If you add workingDays to the schema
      date: moment(history.createdAt).format('DD MMM YYYY'),
      paidBy: history.paidBy || 'Unknown' // If you add paidBy to the schema
    }));

    res.status(200).json(formattedHistories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//Get Salary by Employee 
exports.getSalaryHistoryByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required."
      });
    }

    const salaryHistories = await SalarySetup.find({ employeeName: employeeId })
      .populate('employeeName', 'empName')
      .exec();

    if (!salaryHistories.length) {
      return res.status(404).json({
        success: false,
        message: "No salary history found for this employee."
      });
    }

    const formattedHistories = salaryHistories.map((history) => ({
      sNo: history._id,
      employeeName: history.employeeName.empName,
      totalSalary: history.grossSalary,
      leaveDays: history.leaveDays || 0,
      workingDays: history.workingDays || 0,
      date: moment(history.createdAt).format('DD MMM YYYY'),
      paidBy: history.paidBy || 'Unknown'
    }));

    return res.status(200).json({
      success: true,
      data: formattedHistories,
      message: "Salary history for the employee fetched successfully."
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};