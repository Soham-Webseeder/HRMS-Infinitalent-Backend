const Interview = require("../../models/recruitment/interview");

// Create Interview
exports.createInterview = async (req, res) => {
  try {
    const data = req.body;
    const interview = await Interview.create({ ...data });
    return res.status(200).json({
      success: true,
      data: interview,
      message: "Interview Created Successfully....",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Interview
exports.getAllInterview = async (req, res) => {
  try {
    const interview = await Interview.find({});
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "No Interview Found..",
      });
    }
    return res.status(200).json({
      success: true,
      data: interview,
      message: "Interview Fetched Successfully..",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Interview By Id
exports.getInterviewById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Interview Id is required for fetching Interview",
      });
    }
    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: interview,
      message: "Interview Fetched Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Interview
exports.updateInterview = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Interview Id is required for updatating Interview",
      });
    }
    const updatedData = await Interview.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updatedData) {
      return res.status(404).json({
        success: false,
        message: "Interview Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: updatedData,
      message: "Interview Updated Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Interview
exports.deleteInterview = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Id is required for deleting Interview",
      });
    }
    const deleteData = await Interview.findByIdAndDelete(id);
    if (!deleteData) {
      return res.status(404).json({
        success: false,
        message: "Interview Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: deleteData,
      message: "Interview Deleted Successfully....",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
