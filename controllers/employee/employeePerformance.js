const EmployeePerformance = require("../../models/employee/employeePerformance");

// Create Employee Performance
exports.createEmployeePerformance = async (req, res) => {
  try {
    const data = req.body;
    const empPerformance = await EmployeePerformance.create({ ...data });
    return res.status(200).json({
      success: true,
      data: empPerformance,
      message: "Employee Performance Created Successfully....",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Employee Performance with pagination
exports.getAllEmpPerformance = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const { name } = req.query; // Search term for employee performance name

    // Build the filter object
    let filter = {};
    if (name) {
      filter.performanceName = { $regex: name, $options: "i" }; // Case-insensitive search
    }

    // Fetch the employee performance with the filter applied
    const empPerformance = await EmployeePerformance.find(filter)
      .skip(skip)
      .limit(limit);

      console.log(empPerformance)
    // Count the total number of employee performance records matching the filter
    const totalEmpPerformance = await EmployeePerformance.countDocuments(filter);
    const totalPages = Math.ceil(totalEmpPerformance / limit);

    if (!empPerformance || empPerformance.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Employee Performance Found...",
      });
    }

    return res.status(200).json({
      success: true,
      data: empPerformance,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalEmpPerformance: totalEmpPerformance,
      },
      message: "Employee Performance Fetched Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllEmpPerformanceByMonthAndYear = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const month = req.query.month;
    const year = req.query.year;
    const skip = (page - 1) * limit;
    const { name } = req.query; // Search term for employee performance name

    console.log(year,month)
    const startDate = new Date(year, month-1, 1);
    console.log(startDate)
    const endDate = new Date(year, month, 1);
    // Build the filter object
    let filter = {};
    if (name) {
      filter.performanceName = { $regex: name, $options: "i" }; // Case-insensitive search
    }

    filter.createdAt = {
      $gte: startDate,
      $lt: endDate
    }

    // Fetch the employee performance with the filter applied
    const empPerformance = await EmployeePerformance.find(filter)
      .skip(skip)
      .limit(limit);

    console.log(empPerformance)
    // Count the total number of employee performance records matching the filter
    const totalEmpPerformance = await EmployeePerformance.countDocuments(filter);
    const totalPages = Math.ceil(totalEmpPerformance / limit);

    if (!empPerformance || empPerformance.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Employee Performance Found...",
      });
    }

    return res.status(200).json({
      success: true,
      data: empPerformance,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalEmpPerformance: totalEmpPerformance,
      },
      message: "Employee Performance Fetched Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Get All Employee Performance
exports.getEmployeePerformances = async(req,res)=>{
  const data = await EmployeePerformance.find({})
  if(!data){
    return res.status(404).json({
      success:false,
      message:"Employee Performance Not Found",
    })
  }
  return res.status(200).json({
    success:true,
    message:"Employee Performance Fetched Successfully..",
    data:data
  })
}
// Get Employee Performance By Id
exports.getEmployeePerformanceById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Id is required for fetching Employee Performance",
      });
    }
    const data = await EmployeePerformance.findById(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Employee Performance Not Found",
      });
    } else {
      return res.status(200).json({
        success: true,
        data: data,
        message: "Employee Performance Fetched Successfully..",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Employee Performance
exports.updateEmployeePerformance = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Id is required for Updating Employee Performance",
      });
    }
    const updatedData = await EmployeePerformance.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updatedData) {
      return res.status(404).json({
        success: false,
        message: "Employee Performance Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: updatedData,
      message: "Employee Performance Updated Successfully..",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Employee Performance
exports.deleteEmployeePerformance = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Id is required for Deleting Employee Performance",
      });
    }
    const deleltedData = await EmployeePerformance.findByIdAndDelete(id);
    if (!deleltedData) {
      return res.status(404).json({
        success: false,
        message: "Employee Performance Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: deleltedData,
      message: "Employee Performance Deleted Successfully...",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
