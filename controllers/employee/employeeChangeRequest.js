const express = require("express");
const EmployeeChangeRequest = require("../../models/employee/employeeChangeRequest");
const Employee = require("../../models/employee/employee");
const Notification = require("../../models/notification");
const { createNotification } = require("../../controllers/notification"); // Import the function
const { uploadDocumentToCloudinary } = require('../../utils/uploadDocument');
const { uploadImageToCloudinary } = require("../../utils/imageUploader");


const router = express.Router();

exports.getAllEmployeeChangeRequest = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const { name } = req.query; // Search term for employee name

    // Build the filter object
    let filter = {};
    if (name) {
      filter.$or = [
        { "employeeName.firstName": { $regex: name, $options: "i" } },
        { "employeeName.lastName": { $regex: name, $options: "i" } },
      ];
    }

    // Fetch the employee change requests with the filter applied
    const employeeChangeRequests = await EmployeeChangeRequest.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("employeeName", "firstName lastName");

    // Count the total number of employee change requests matching the filter
    const totalRequests = await EmployeeChangeRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalRequests / limit);

    if (!employeeChangeRequests || employeeChangeRequests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Employee Change Request Found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: employeeChangeRequests,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalRequests: totalRequests,
      },
      message: "Employee Change Requests Fetched Successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getAllEmployeeChangeRequestByEmployeeName = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(500).json({
        success: false,
        message: "Invalid Id",
      });
    }

    const employeeChangeRequest = await EmployeeChangeRequest.find({
      employeeName: id,
    });

    return res.status(200).json({
      success: true,
      data: { employeeChangeRequest },
      message: "Successfully fetched all requests for Employee detail changes",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while updating attendance",
    });
  }
};

exports.getAllEmployeeChangeRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const employeeChangeRequest = await EmployeeChangeRequest.findById(id);

    if (!employeeChangeRequest) {
      res.status(500).json({
        success: false,
        message: "Invalid Id",
      });
    }

    return res.status(200).json({
      success: true,
      data: { employeeChangeRequest },
      message: "Successfully fetched all requests for Employee detail changes",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while updating attendance",
    });
  }
};

exports.updateEmployeeChangeRequestStatusById = async (req, res) => {
  try {
    const { id, status } = req.body;

    const changeRequest = await EmployeeChangeRequest.findById(id);
    if (!changeRequest) return res.status(404).json({ success: false, message: "Request not found" });

    changeRequest.status = status;

    if (status === 'Approved') {
      // Since 'changes' already contains the local Multer paths from updateProfile,
      // we simply apply them directly to the Employee document.
      const updatedEmployee = await Employee.findByIdAndUpdate(
        changeRequest.employeeName,
        changeRequest.changes,
        { new: true }
      );

      if (!updatedEmployee) {
        return res.status(404).json({ success: false, message: "Target Employee record not found" });
      }
    }

    await changeRequest.save();

    // Create notification using existing logic
    await createNotification({
      employeeId: changeRequest.employeeName,
      message: `Your profile change request has been ${status}.`,
      type: "PROFILE_UPDATE",
      title: "Update Request Status"
    });

    return res.status(200).json({
      success: true,
      message: `Request ${status} successfully.`,
      data: changeRequest
    });
  } catch (error) {
    console.error("Approval Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Controller function to delete a change request
exports.deleteChangeRequest = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the change request by ID
        const changeRequest = await EmployeeChangeRequest.findById(id);

        if (!changeRequest) {
            return res.status(404).json({ message: 'Change request not found' });
        }

        // Check if the status is "Approved"
        if (changeRequest.status === 'Approved') {
            return res.status(400).json({ message: 'Cannot delete an approved change request' });
        }

        // If status is "Pending" or "Rejected", proceed with deletion
        await EmployeeChangeRequest.findByIdAndDelete(id);

        res.status(200).json({ message: 'Change request deleted successfully' });
    } catch (error) {
        console.error('Error deleting change request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

