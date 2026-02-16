const LeaveApplication = require("../../models/leave/leaveApplication");
const { uploadImageToCloudinary } = require("../../utils/imageUploader");
const { createNotification } = require("../notification");

// exports.createLeaveApplication = async (req, res) => {
//   try {
//     const data = req.body;
//     let hardCopyImageUrl = null;

//     // Check if there's a file in the request
//     if (req.files && req.files.applicationHardCopy) {
//       const hardCopyImage = req.files.applicationHardCopy;

//       // Upload the image to Cloudinary
//       const uploadedImage = await uploadImageToCloudinary(
//         hardCopyImage.path, // Ensure that `path` is correctly referenced from the file
//         process.env.FOLDER_NAME,
//         1000, // Width resize
//         1000  // Height resize
//       );

//       // Store the secure URL of the uploaded image
//       if (uploadedImage && uploadedImage.secure_url) {
//         hardCopyImageUrl = uploadedImage.secure_url;
//       } else {
//         throw new Error("Image upload failed.");
//       }
//     }

//     // Add the URL to the data if an image was uploaded
//     if (hardCopyImageUrl) {
//       data.applicationHardCopy = hardCopyImageUrl;
//     }

//     // Create a new leave application in the database
//     const newLeaveApplication = await LeaveApplication.create(data);

//     return res.status(201).json({
//       success: true,
//       data: newLeaveApplication,
//       message: "Leave Application Created Successfully.",
//     });
//   } catch (error) {
//     console.error("Error creating leave application:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// Create Leave Application
exports.createLeaveApplication = async (req, res) => {
  try {
    const { paidLeave, leaveDuration, paidLeaveDays, ...otherData } = req.body;
    let hardCopyImageUrl = null;

    if (req.files && req.files.applicationHardCopy) {
      const hardCopyImage = req.files.applicationHardCopy;

      const uploadedImage = await uploadImageToCloudinary(
        hardCopyImage.path,
        process.env.FOLDER_NAME,
        1000,
        1000
      );

      if (uploadedImage && uploadedImage.secure_url) {
        hardCopyImageUrl = uploadedImage.secure_url;
      } else {
        throw new Error("Image upload failed.");
      }
    }

    const data = {
      ...otherData,
      paidLeave,
      leaveDuration,
      paidLeaveDays,
    };

    if (hardCopyImageUrl) {
      data.applicationHardCopy = hardCopyImageUrl;
    }

    const newLeaveApplication = await LeaveApplication.create(data);

    return res.status(201).json({
      success: true,
      data: newLeaveApplication,
      message: "Leave Application Created Successfully.",
    });
  } catch (error) {
    console.error("Error creating leave application:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get Leave Application By Id
exports.getLeaveApplicationById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Id is required for Fetching Leave Application",
      });
    }
    const data = await LeaveApplication.findById(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No Data Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: data,
      message: "Leave Application Fetched Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Leave Applications
exports.getAllLeaveApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) ||5;
    const skip = (page - 1) * limit;
    const { name } = req.query;

    // Build the filter object
    let filter = {};
    if (name) {
      filter.leaveApplicationName = { $regex: name, $options: "i" }; // Case-insensitive search on leaveApplicationName
    }

    const data = await LeaveApplication.find(filter).skip(skip).limit(limit).populate("leaveType","leaveType");
    const totalLeaves = await LeaveApplication.countDocuments(filter);
    const totalPages = Math.ceil(totalLeaves / limit);

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Data Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: data,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalLeaves: totalLeaves,
      },
      message: "Leave Applications Fetched Successfully....",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getLeaveApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    const { name } = req.query;

    // Build the filter object
    let filter = {};
    if (name) {
      filter.leaveApplicationName = { $regex: name, $options: "i" }; // Case-insensitive search on leaveApplicationName
    }

    const data = await LeaveApplication.find({}).populate("leaveType","leaveType")

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Data Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: data,

      message: "Leave Applications Fetched Successfully....",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Leave Application
// exports.updateLeaveApplication = async (req, res) => {
//   try {
//     const id = req.params.id;
//     if (!id) {
//       return res.status(401).json({
//         success: false,
//         message: "Id is required for Updating Leave Application",
//       });
//     }

//     const hardCopyImage = req.files && req.files.hardCopyUrl;
//     const {
//       applicationStartDate,
//       applyDay,
//       approveStartDate,
//       approvedDay,
//       reason,
//       leaveType,
//       applicationEndDate,
//       approvedEndDate,
//       leaveRequestDate,
//       employeeName,
//       approvedBy,
//       status,
//     } = req.body;

//     let updatedLeaveApplication = {
//       employeeName,
//       applicationStartDate,
//       applyDay,
//       approveStartDate,
//       approvedDay,
//       reason,
//       applicationEndDate,
//       approvedEndDate,
//       leaveRequestDate,
//       approvedBy,
//       leaveType,
//       status,
//     };

//     if (hardCopyImage) {
//       const uploadedImage = await uploadImageToCloudinary(
//         hardCopyImage,
//         process.env.FOLDER_NAME,
//         1000,
//         1000
//       );
//       updatedLeaveApplication.applicationHardCopy = uploadedImage.secure_url;
//     }

//     const update = await LeaveApplication.findByIdAndUpdate(
//       id,
//       updatedLeaveApplication,
//       {
//         new: true,
//       }
//     );
//     return res.status(200).json({
//       success: true,
//       data: update,
//       message: "Leave Application Updated Successfully...",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// Update Leave Application
exports.updateLeaveApplication = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Id is required for Updating Leave Application",
      });
    }

    const hardCopyImage = req.files && req.files.hardCopyUrl;
    const {
      paidLeave,
      leaveDuration,
      paidLeaveDays,
      ...otherData
    } = req.body;

    let updatedLeaveApplication = {
      ...otherData,
      paidLeave,
      leaveDuration,
      paidLeaveDays,
    };

    if (hardCopyImage) {
      const uploadedImage = await uploadImageToCloudinary(
        hardCopyImage,
        process.env.FOLDER_NAME,
        1000,
        1000
      );
      updatedLeaveApplication.applicationHardCopy = uploadedImage.secure_url;
    }

    const update = await LeaveApplication.findByIdAndUpdate(
      id,
      updatedLeaveApplication,
      {
        new: true,
      }
    );
    if (updatedLeaveApplication.status === "Approved" || updatedLeaveApplication.status === "Rejected") {
      await createNotification(update.employeeId, `Your Leave Application was ${otherData.status}`, "Leave");
    }
    return res.status(200).json({
      success: true,
      data: update,
      message: "Leave Application Updated Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Delete Leave Application
exports.deleteLeaveApplication = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Id is required for Deleting Leave Application",
      });
    }
    const deletedData = await LeaveApplication.findByIdAndDelete(id);
    if (!deletedData) {
      return res.status(404).json({
        success: false,
        message: "No Data Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: deletedData,
      message: "Leave Application Deleted Successfully..",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getLeaveApplicationsByEmployee = async (req, res) => {
  const userId = req.params.userId;

  try {
    const leaveApplications = await LeaveApplication.find({ employeeId: userId }).populate("leaveType","leaveType");
    res.status(200).json({
      success: true,
      data: leaveApplications,
    });
  } catch (error) {
    console.error("Error fetching leave applications:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching leave applications",
    });
  }
};