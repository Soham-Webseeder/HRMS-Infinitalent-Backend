const Shortlist = require('../../models/recruitment/shortlist')
const Candidate = require('../../models/recruitment/candidate')
const Position = require('../../models/employee/position')
// Create Shortlist
exports.createShortlist = async (req, res) => {
  try {
    const { positionId, ...otherData } = req.body;
    // Find the candidate by firstName and lastName
    const candidate = await Candidate.findById(req.body.candidateName);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate Not Found",
      });
    }
    // Find the job position by ID
    const position = await Position.findById(req.body.jobPosition);
    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Position Not Found",
      });
    }
    // Create Shortlist with candidateId and positionId
    const shortlist = await Shortlist.create({
      candidateName: candidate._id,
      jobPosition: positionId,
      ...otherData,
    });
    // Respond with the shortlist data including candidate id and name
    return res.status(200).json({
      success: true,
      data: {
        _id: shortlist._id,
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
      message: "Shortlist Created Successfully....",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get All Shortlist
exports.getAllShortlist = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    const { name } = req.query;

    // Build the filter object
    let filter = {};
    if (name) {
      filter.shortlistName = { $regex: name, $options: "i" }; // Case-insensitive search on shortlistName
    }

    // Fetch the shortlists with the filter applied
    const shortlist = await Shortlist.find(filter).skip(skip).limit(limit);

    const totalShortlists = await Shortlist.countDocuments(filter);
    const totalPages = Math.ceil(totalShortlists / limit);

    if (!shortlist || shortlist.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Shortlist Found.",
      });
    }

    // Map over each shortlist entry and populate the candidateName and jobPosition fields
    const populatedShortlist = await Promise.all(shortlist.map(async entry => {
      const populatedCandidate = await Candidate.findById(entry.candidateName);
      const populatedPosition = await Position.findById(entry.jobPosition);
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
      data: populatedShortlist,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalShortlists: totalShortlists,
      },
      message: "Shortlist Fetched Successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Shortlist By Id
exports.getShortlistById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Shortlist Id is required for fetching candidate",
      });
    }
    const shortlist = await Shortlist.findById(id)
      .populate({
        path: 'candidateName',
        select: '_id firstName lastName'
      })
      .populate({
        path: 'jobPosition',
        select: '_id position'
      });
    if (!shortlist) {
      return res.status(404).json({
        success: false,
        message: "Shortlist Not Found",
      });
    }
    // Extract position details from the populated jobPosition
    const jobPosition = {
      _id: shortlist.jobPosition._id,
      name: shortlist.jobPosition.position
    };
    return res.status(200).json({
      success: true,
      data: {
        _id: shortlist._id,
        candidateName: {
          _id: shortlist.candidateName._id,
          name: `${shortlist.candidateName.firstName} ${shortlist.candidateName.lastName}`
        },
        jobPosition: jobPosition,
        shortlistDate:shortlist.shortlistDate,
        interviewDate:shortlist.interviewDate
      },
      message: "Shortlist Fetched Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Update Shortlist
exports.updateShortlist = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Shortlist Id is required for updating Shortlist",
      });
    }
    const updatedData = await Shortlist.findByIdAndUpdate(id, data, {
      new: true,
    })
    .populate({
      path: 'candidateName',
      select: 'firstName lastName'
    })
    .populate({
      path: 'jobPosition',
      select: 'name'
    });
    if (!updatedData) {
      return res.status(404).json({
        success: false,
        message: "Shortlist Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: updatedData,
      message: "Shortlist Updated Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Delete Shortlist
exports.deleteShortlist = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Id is required for deleting Shortlist",
      });
    }
    const deletedShortlist = await Shortlist.findByIdAndDelete(id)
      .populate({
        path: 'candidateName',
        select: 'firstName lastName'
      })
      .populate({
        path: 'jobPosition',
        select: 'name'
      });
    if (!deletedShortlist) {
      return res.status(404).json({
        success: false,
        message: "Shortlist Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: deletedShortlist,
      message: "Shortlist Deleted Successfully....",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};