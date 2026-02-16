const BusinessUnit = require("../../models/company/bussinessUnit");

// Create a new business unit
exports.createBusinessUnit = async (req, res) => {
  try {
    const businessUnitData = { ...req.body };
    const businessUnit = new BusinessUnit(businessUnitData);
    await businessUnit.save();

    res.status(201).json({
      success: true,
      response: businessUnit,
      message: "Business Unit created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while creating business unit",
    });
  }
};

//
exports.getAllBusinessUnits = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;
      const { name } = req.query;
  
      // Build the filter object
      let filter = {};
      if (name) {
        filter.name = { $regex: name, $options: "i" };
      }
  
      // Fetch the business units with pagination and filters
      const businessUnits = await BusinessUnit.find(filter).skip(skip).limit(limit);
      const totalBusinessUnits = await BusinessUnit.countDocuments(filter);
      const totalPages = Math.ceil(totalBusinessUnits / limit);
  
      if (!businessUnits || businessUnits.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No business units found",
        });
      }
  
      res.status(200).json({
        success: true,
        response: businessUnits,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalBusinessUnits: totalBusinessUnits,
        },
        message: "Business units fetched successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error while fetching business units",
      });
    }
  };


// Get All Bussiness Unit
exports.getBusinessUnits = async (req, res) => {
  try {
    const businessUnits = await BusinessUnit.find({});

    if (!businessUnits || businessUnits.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No business units found",
      });
    }

    res.status(200).json({
      success: true,
      response: businessUnits,

      message: "Business units fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching business units",
    });
  }
};

  exports.getBusinessUnitById = async (req, res) => {
    try {
      const businessUnit = await BusinessUnit.findById(req.params.id);
      if (!businessUnit) {
        return res.status(404).json({
          success: false,
          message: "Business Unit not found",
        });
      }
      res.status(200).json({
        success: true,
        response: businessUnit,
        message: "Business Unit fetched successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error while getting business unit details",
      });
    }
  };

  exports.updateBusinessUnitById = async (req, res) => {
    try {
      const businessUnit = await BusinessUnit.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!businessUnit) {
        return res.status(404).json({
          success: false,
          message: "Business Unit not found",
        });
      }
      res.status(200).json({
        success: true,
        response: businessUnit,
        message: "Business Unit updated successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error while updating business unit",
      });
    }
  };

  exports.deleteBusinessUnitById = async (req, res) => {
    try {
      const businessUnit = await BusinessUnit.findById(req.params.id);
      if (!businessUnit) {
        return res.status(404).json({
          success: false,
          message: "Business Unit not found",
        });
      }
      await businessUnit.deleteOne();
      res.status(200).json({
        success: true,
        message: "Business Unit deleted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error while deleting business unit",
      });
    }
  };
  