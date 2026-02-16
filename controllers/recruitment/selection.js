const Selection = require("../../models/recruitment/selection");
const Candidate = require('../../models/recruitment/candidate')
const Position = require('../../models/employee/position')
// Create Selection
exports.createSelection = async (req, res) => {
  try {
    const { candidateName, positionId, ...otherData } = req.body;
    console.log(req.body, "reqnbbopsdafjopfsdakopf")
    // Find the candidate by firstName and lastName
    const candidate = await Candidate.findById(req.body.candidateName);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate Not Found",
      });
    }
    // Find the job position by ID
    const position = await Position.findById(req.body.position);
    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Position Not Found",
      });
    }
    const selection = await Selection.create({
      candidateName: candidateName,
      position: positionId,
      ...otherData,
     });
     return res.status(200).json({
      success: true,
      data: {
        _id: selection._id,
        candidate: {
          _id: candidate._id,
          name: `${candidate.firstName} ${candidate.lastName}`,
        },
        position: {
          _id: position._id,
          name: position.position,
        },
        ...otherData,
      },
      message: "Selection Created Successfully....",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Selection
exports.getAllSelection = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    const { name } = req.query;

    // Build the filter object
    let filter = {};
    if (name) {
      filter.selectionName = { $regex: name, $options: "i" }; // Case-insensitive search on selectionName
    }

    // Fetch the selections with the filter applied
    const selection = await Selection.find(filter).skip(skip).limit(limit);

    const totalSelections = await Selection.countDocuments(filter);
    const totalPages = Math.ceil(totalSelections / limit);

    if (!selection || selection.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No selection found.",
      });
    }

    // Map over each selection entry and populate the candidateName and jobPosition fields
    const populatedSelection = await Promise.all(selection.map(async entry => {
      const populatedCandidate = await Candidate.findById(entry.candidateName);
      const populatedPosition = await Position.findById(entry.position);
      return {
        ...entry.toObject(), // Convert Mongoose document to plain JavaScript object
        candidateName: populatedCandidate ? {
          _id: populatedCandidate._id,
          name: `${populatedCandidate.firstName} ${populatedCandidate.lastName}`
        } : 'Unknown',
        jobPosition: populatedPosition ? {
          _id: populatedPosition._id,
          name: populatedPosition.position
        } : 'Unknown',
      };
    }));

    return res.status(200).json({
      success: true,
      data: populatedSelection,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalSelections: totalSelections,
      },
      message: "Selection fetched successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Selection By Id
exports.getSelectionById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Selection Id is required for fetching Selection",
      });
    }
    const selection = await Selection.findById(id)
    .populate({
      path: 'candidateName',
      select: '_id firstName lastName'
    })
    .populate({
      path: 'position',
      select: '_id position'
    });
    if (!selection) {
      return res.status(404).json({
        success: false,
        message: "Selection Not Found",
      });
    }
    // Check if position is populated and exists
    if (!selection.position) {
      return res.status(404).json({
        success: false,
        message: "Position details not found",
      });
    }
    // Extract position details from the populated position field
    const jobPosition = {
      _id: selection.position._id,
      name: selection.position.position
    };
    return res.status(200).json({
      success: true,
      data: {
        _id: selection._id,
        candidateName: {
          _id: selection.candidateName._id,
          name: `${selection.candidateName.firstName} ${selection.candidateName.lastName}`
        },
        jobPosition: jobPosition,
        selectionTerms: selection.selectionTerms
      },
      message: "Selection Fetched Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Update Selection
exports.updateSelection = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Selection Id is required for updatating Selection",
      });
    }
    const updatedData = await Selection.findByIdAndUpdate(id, data, {
      new: true,
    })
    .populate({
      path: 'candidateName',
      select: 'firstName lastName'
    })
    .populate({
      path: 'position',
      select: 'position'
    });
    if (!updatedData) {
      return res.status(404).json({
        success: false,
        message: "Selection Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: updatedData,
      message: "Selection Updated Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Delete Selection
exports.deleteSelection = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Id is required for deleting Interview",
      });
    }
    const deleteData = await Selection.findByIdAndDelete(id)
    .populate({
      path: 'candidateName',
      select: 'firstName lastName'
    })
    .populate({
      path: 'position',
      select: 'position'
    });
    ;
    if (!deleteData) {
      return res.status(404).json({
        success: false,
        message: "Selection Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: deleteData,
      message: "Selection Deleted Successfully....",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};







