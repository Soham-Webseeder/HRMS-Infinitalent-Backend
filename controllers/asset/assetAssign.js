const AssetAssign = require("../../models/asset/assetAssign");

// Create Asset Assign
exports.createAssetAssign = async (req, res) => {
  try {
    const value = req.body;
    const assetAssign = await AssetAssign.create({ ...value });
    return res.status(200).json({
      success: true,
      data: assetAssign,
      message: "Asset Assisned Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Asset Assign By Id
exports.getAssetAssignById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Id is required for fetching Asset Assign",
      });
    }
    const assetAssign = await AssetAssign.findById(id);
    if (!assetAssign) {
      return res.status(404).json({
        success: false,
        message: "Asset Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: assetAssign,
      message: "Asset Assisnment Fetched Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Asset Assignments
exports.getAllAssetAssigns = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const { name } = req.query;

    console.log(page,"page")

    // Build the filter object
    let filter = {};
    if (name) {
      filter.assignName = { $regex: name, $options: "i" }; // Case-insensitive search on assignName
    }

    // Fetch asset assignments based on the filter and pagination
    const assetAssigns = await AssetAssign.find(filter)
      .skip(skip)
      .limit(limit);

    const totalAssetAssigns = await AssetAssign.countDocuments(filter);
    const totalPages = Math.ceil(totalAssetAssigns / limit);

    if (!assetAssigns || assetAssigns.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Data Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: assetAssigns,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalAssetAssigns: totalAssetAssigns,
      },
      message: "Asset Assignments Fetched Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Update Asset Assignment
exports.updateAssetAssign = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Id is required for updating Asset Assign",
      });
    }
    const updatedData = await AssetAssign.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updatedData) {
      return res.status(404).json({
        success: false,
        message: "Asset Assignment Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: updatedData,
      message: "Asset Assignment Updated Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Asset Assignment
exports.deleteAssetAssign = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Id is required for updating Asset Assign",
      });
    }
    const deletedData = await AssetAssign.findByIdAndDelete(id);
    if (!deletedData) {
      return res.status(404).json({
        success: false,
        message: "Asset Assignment Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: deletedData,
      message: "Asset Assignments Deleted Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get asset assign by Employee Name

exports.getAssetAssignByEmployee =  async (req, res) => {
  const { empId } = req.params.id;

  try {
    const assetAssignments = await AssetAssign.findOne({ empId })
      .populate({
        path: "empId",
        select: "firstName lastName",
        model: "Employee" // Adjust this to match your Employee model name
      })
      .exec();
      // console.log(assetAssignments,"assetAssignments")

    res.json(assetAssignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};