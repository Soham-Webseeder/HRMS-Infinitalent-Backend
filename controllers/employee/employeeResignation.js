const Resignation = require("../../models/employee/employeeresignation");
const Employee = require("../../models/employee/employee");
const { createNotification } = require("../notification");
const { uploadDocumentToCloudinary } = require("../../utils/uploadDocument");

exports.createResignation = async (req, res) => {
  try {
    const { employeeId, reason } = req.body;
    const resignationDate = new Date();

    // Check for a document in the request
    const image = req.files && req.files.image;

    let documentUrl = null;

    // Upload document if provided
    if (image) {
      const uploadedDocument = await uploadDocumentToCloudinary(
        image,
        process.env.FOLDER_NAME // Use a specific folder in Cloudinary if needed
      );
      documentUrl = uploadedDocument.secure_url;
    }

    // Create the resignation document in the database with status "Pending"
    const resignation = new Resignation({
      employeeId,
      resignationDate,
      reason,
      status: "Pending",   // <-- new field to track approval status
      image: documentUrl,
      isResigned: false,   // Initially false, only true when approved
    });

    await resignation.save();

    await createNotification(
      employeeId,
      "Your Resignation request is recorded and pending approval",
      "Resign"
    );

    res.status(201).send({
      message: "Resignation request recorded and pending approval",
      resignation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error recording resignation",
      error,
    });
  }
};

exports.updateResignationStatus = async (req, res) => {
  try {
    const resignationId = req.params.id;
    const { status } = req.body; // Expecting status: "Pending", "Approved", "Rejected"

    // Validate status
    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).send({ message: "Invalid status value" });
    }

    // Find the resignation document
    const resignation = await Resignation.findById(resignationId);
    if (!resignation) {
      return res.status(404).send({ message: "Resignation not found" });
    }

    // Update resignation status and isResigned flag accordingly
    resignation.status = status;
    resignation.isResigned = status === "Approved";
    await resignation.save();

    // If approved, update employee employmentStatus to "Resigned"
    if (status === "Approved") {
      await Employee.findByIdAndUpdate(resignation.employeeId, {
        employmentStatus: "Resigned",
        isResigned: true,
      });
    }

    await createNotification(
      resignation.employeeId,
      `Your Resignation status is updated to ${status}`,
      "Resign"
    );

    res.status(200).send({
      message: "Resignation status updated",
      resignation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error updating resignation status",
      error,
    });
  }
};

exports.getAllResignations = async (req, res) => {
  try {
    // Fetch all resignation requests with employee details
    const resignations = await Resignation.find()
      .populate("employeeId")
      .sort({ resignationDate: -1 }); // latest first

    res.status(200).json({
      success: true,
      data: resignations,
    });
  } catch (error) {
    res.status(500).send({ message: "Error fetching resignations", error });
  }
};
