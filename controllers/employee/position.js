const Position = require("../../models/employee/position");

// Create Position
exports.createPosition = async (req, res) => {
  try {
    const data = req.body;
    const position = await Position.create({ ...data });

    return res.status(200).json({
      success: true,
      data: position,
      message: "Position Created Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Position
exports.updatePosition = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Id is required for updating the position",
      });
    }
    const dataToBeUpdate = await Position.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Position Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: dataToBeUpdate,
      message: "Position Updated Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Positions
exports.getAllPositions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const { name } = req.query; // Search term for position name

    // Build the filter object
    let filter = {};
    if (name) {
      filter.positionName = { $regex: name, $options: "i" }; // Case-insensitive search
    }

    // Fetch the positions with the filter applied
    const positions = await Position.find(filter).skip(skip).limit(limit);
    
    // Count the total number of positions matching the filter
    const totalPositions = await Position.countDocuments(filter);
    const totalPages = Math.ceil(totalPositions / limit);

    if (!positions || positions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No positions found",
      });
    }

    return res.status(200).json({
      success: true,
      data: positions,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalPositions: totalPositions,
      },
      message: "Positions fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Delete Position
exports.deletePosition = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Id is required for deleting the position",
      });
    }
    const deletedPosition = await Position.findByIdAndDelete(id);
    if (!deletedPosition) {
      return res.status(404).json({
        success: false,
        message: "Position Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: deletedPosition,
      message: "Position Deleted Successfully..",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Position By Id
exports.getPositionById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Id is required for fetching the position",
      });
    }
    const position = await Position.findById(id);
    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Position Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: position,
      message: "Position Fetched Successfully..",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
