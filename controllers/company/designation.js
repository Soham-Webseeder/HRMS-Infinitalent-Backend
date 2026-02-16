const Company = require("../../models/company/company");
const Designation = require("../../models/company/designation");

// Create a new designation for a specific company
exports.createDesignation = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const designationData = {
      company: companyId,
      ...req.body,
    };

    const designation = new Designation(designationData);
    await designation.save();

    company.designations.push(designation._id);
    await company.save();

    res.status(201).json({
      success: true,
      response: designation,
      message: "Designation created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while creating designation",
    });
  }
};

// Get all designations
exports.getAllDesignations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const { name } = req.query;

    // Build the filter object
    let filter = {};
    if (name) {
      filter.name = { $regex: name, $options: "i" }; // Search by 'name' field in Designation schema
    }
    console.log("Filter applied:", filter);

    // Fetch the designations with the filter applied
    const designations = await Designation.find(filter).skip(skip).limit(limit);
    
    
    // Count the total number of designations matching the filter
    const totalDesignation = await Designation.countDocuments(filter);
    const totalPages = Math.ceil(totalDesignation / limit);

    if (!designations || designations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No designations found",
      });
    }

    res.status(200).json({
      success: true,
      response: designations,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalDesignation: totalDesignation,
      },
      message: "Designations fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching designations",
    });
  }
};

// Get All Designation
exports.getDesignations = async (req, res) => {
  try {
    const designations = await Designation.find({});
    if (!designations || designations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No designations found",
      });
    }

    res.status(200).json({
      success: true,
      response: designations,
      message: "Designations fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching designations",
    });
  }
};

// Get designation by ID
exports.getDesignationById = async (req, res) => {
  try {
    const designation = await Designation.findById(req.params.id);
    if (!designation) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }
    res.status(200).json({
      success: true,
      response: designation,
      message: "Designation fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while getting designation details",
    });
  }
};

// Update designation by ID
exports.updateDesignationById = async (req, res) => {
  try {
    const designation = await Designation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!designation) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }
    res.status(200).json({
      success: true,
      response: designation,
      message: "Designation updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while updating designation",
    });
  }
};

// Delete designation by ID
exports.deleteDesignationById = async (req, res) => {
  try {
    const designation = await Designation.findById(req.params.id);
    if (!designation) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }
    await designation.deleteOne();
    res.status(200).json({
      success: true,
      message: "Designation deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while deleting designation",
    });
  }
};
