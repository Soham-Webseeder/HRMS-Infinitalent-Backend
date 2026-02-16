// divisionController.js
const Department = require("../../models/company/department");
const Division = require("../../models/company/division");

// Create a new division
exports.createDivision = async (req, res) => {
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

    // Create a new division
    const { divisionName } = req.body;
    const divisionData = {
      department: departmentId,
      divisionName,
    };
    const division = new Division(divisionData);
    await division.save();

    // Add the division to the department's divisions array
    department.division.push(division._id);
    await department.save();

    res.status(201).json({
      success: true,
      response: division,
      message: "Division created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while creating division",
    });
  }
};

// Get division by ID
exports.getDivisionById = async (req, res) => {
  try {
    const division = await Division.findById(req.params.id);
    if (!division) {
      return res.status(404).json({
        success: false,
        message: "Division not found",
      });
    }
    res.status(200).json({
      success: true,
      response: division,
      message: "Division fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while getting division details",
    });
  }
};

// Get all divisions in a department
exports.getAllDivisionsByDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;
    if (!departmentId) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const divisions = await Division.find({ department: departmentId });

    res.status(200).json({
      success: true,
      response: divisions,
      message: "Divisions fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching divisions",
    });
  }
};

// Update division by ID
exports.updateDivisionById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const division = await Division.findByIdAndUpdate(id, data, { new: true });

    if (!division) {
      return res.status(404).json({
        success: false,
        message: "Division not found",
      });
    }
    res.status(200).json({
      success: true,
      response: division,
      message: "Division updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while updating division",
    });
  }
};

// Delete division by ID
exports.deleteDivision = async (req, res) => {
  try {
    const divisionId = req.params.id;

    // Check if the division exists
    const division = await Division.findById(divisionId);
    if (!division) {
      return res.status(404).json({
        success: false,
        message: "Division not found",
      });
    }

    // Remove division from its department
    const department = await Department.findById(division.department);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Remove division ID from department's divisions array
    department.division = department.division.filter(
      (divId) => divId.toString() !== divisionId
    );
    await department.save();

    // Delete the division
    await Division.findByIdAndDelete(divisionId);

    res.status(200).json({
      success: true,
      message: "Division deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while deleting division",
    });
  }
};

// Get All Division
exports.getAllDivisions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const { name, department } = req.query;

    let filter = {};
    if (name) {
      filter.divisionName = { $regex: name, $options: "i" }; 
    }
    if (department) {
      filter.department = department; 
    }

    const divisions = await Division.find(filter).populate('department').skip(skip).limit(limit);

    const totalDivisions = await Division.countDocuments(filter);
    const totalPages = Math.ceil(totalDivisions / limit);

    if (divisions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No divisions found",
      });
    }

    return res.status(200).json({
      success: true,
      data: divisions,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalDivisions: totalDivisions,
      },
      message: "Divisions fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching divisions",
    });
  }
};
