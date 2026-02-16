const Company = require("../../models/company/company");
const Department = require("../../models/company/department");
const Employee = require("../../models/employee/employee");


// Create a new department
exports.createDepartment = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const departmentData = {
      company: companyId,
      title: req.body.title,
      ...req.body,
    };

    const department = new Department(departmentData);
    await department.save();

    company.departments.push(department._id);
    await company.save();

    res.status(201).json({
      success: true,
      response: department,
      message: "Department created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while creating department",
    });
  }
};

// Get department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }
    res.status(200).json({
      success: true,
      response: department,
      message: "Department fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while getting department details",
    });
  }
};

// Get Departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({})
    if(!departments){
      res.status(404).json({
        success: false,
        message: "Departments Not Found",
      });
    }
    res.status(200).json({
      success: true,
      response: departments,
      message: "Departments fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching departments",
    });
  }
};

// Get All Departments with optional name filter

exports.getAllDepartments = async (req, res) => {
  try {
    const { page = 1, limit = 5, name } = req.query;
    const skip = (page - 1) * limit;

    // Build the filter object for department search
    let filter = {};
    if (name) {
      filter['department.title'] = { $regex: name, $options: "i" };
    }

    // Fetch departments based on the filter and pagination
    const departments = await Department.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('division');

    if (!departments || departments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No departments found",
      });
    }

    // Get employee count for each department
    const departmentsWithEmployeeCount = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await Employee.countDocuments({ department: dept.department.title }); // Use dept._id if department is an ObjectId
        return {
          ...dept.toObject(),
          employeeCount,
        };
      })
    );

    const totalDepartments = await Department.countDocuments(filter);
    const totalPages = Math.ceil(totalDepartments / limit);

    res.status(200).json({
      success: true,
      response: departmentsWithEmployeeCount,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalDepartments: totalDepartments,
      },
      message: "Departments fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching departments",
    });
  }
};

// Update department by ID
exports.updateDepartmentById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const department = await Department.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }
    res.status(200).json({
      success: true,
      response: department,
      message: "Department updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while updating department",
    });
  }
};

// Delete department by ID
exports.deleteDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;

    // Check if the department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Remove department from its company
    const company = await Company.findById(department.company);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Remove department ID from company's departments array
    company.departments = company.departments.filter(
      (depId) => depId.toString() !== departmentId
    );
    await company.save();

    // Delete the department
    await Department.findByIdAndDelete(departmentId);

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while deleting department",
    });
  }
};
