const LeaveType = require('../../models/leave/leaveType'); // Ensure this is declared only once

exports.createLeaveType = async (req, res) => {
  try {
    const leaveType = new LeaveType(req.body); // Create new leave type instance
    const savedLeaveType = await leaveType.save(); // Save to the database

    res.status(201).json({
      success: true,
      data: savedLeaveType,
      message: "Leave Type Created Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error creating leave type",
    });
  }
};


// Get All Leaves Types
exports.getAllLeaveType = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const leaveTypes = await LeaveType.find({})
      .skip(skip)
      .limit(limit);

    const totalLeaves = await LeaveType.countDocuments();
    const totalPages = Math.ceil(totalLeaves / limit);

    res.status(200).json({
      success: true,
      data: leaveTypes,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalLeaves: totalLeaves,
      },
      message: "Leave Types Fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get Leave Type By Id
exports.getLeaveTypeById = async (req, res) => {
  try {
    const leaveTypeId = req.params.id;
    const leaveType = await LeaveType.findById(leaveTypeId);
    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave Type Not Found",
      });
    }
    res.status(200).json({
      success: true,
      data: leaveType,
      message: "Leave Type Fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Update Leave Type
exports.updateLeaveType = async (req, res) => {
  try {
    const leaveTypeId = req.params.id;
    const updatedLeaveType = await LeaveType.findByIdAndUpdate(
      leaveTypeId,
      req.body,
      { new: true }
    );
    if (!updatedLeaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave Type Not Found",
      });
    }
    res.status(200).json({
      success: true,
      data: updatedLeaveType,
      message: "Leave Type Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Leave type
exports.deleteLeaveType = async (req, res) => {
  try {
    const leaveTypeId = req.params.id;
    const deletedLeaveType = await LeaveType.findByIdAndDelete(leaveTypeId);
    if (!deletedLeaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave Type Not Found",
      });
    }
    res.status(200).json({
      success: true,
      data: deletedLeaveType,
      message: "Leave Type Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
