const Policy = require('../../models/company/policy');
const { uploadDocumentToCloudinary } = require('../../utils/uploadDocument');
const fs = require("fs");


// Create Policy
exports.createPolicy = async (req, res) => {
  try {
    let data = req.body;

    // Check for a document in the request
    const document = req.files && req.files.document;

    // Upload document if provided
    if (document) {
      const uploadedDocument = await uploadDocumentToCloudinary(
        document,
        process.env.FOLDER_NAME // Use a specific folder in Cloudinary if needed
      );
      data.document = uploadedDocument.secure_url; // Store the document's Cloudinary URL in the database
    }

    // Create the policy document in the database
    const policy = await Policy.create({ ...data });
    await policy.save();


    return res.status(200).json({
      success: true,
      data: policy,
      message: "Policy Created Successfully...",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all Policies
exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find();
    if (!policies || policies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No policies found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: policies,
      message: "Policies fetched successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Policy by ID
exports.getPolicyById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Policy ID is required.",
      });
    }

    const policy = await Policy.findById(id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: policy,
      message: "Policy fetched successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Policy
exports.updatePolicy = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Policy ID is required.",
      });
    }

    const document = req.files && req.files.document;
    const { title, description } = req.body;
    let updatedPolicy = { title, description };

    const newFileName = `${document.tempFilePath}.pdf`;
    fs.renameSync(document.tempFilePath, newFileName);

    document.tempFilePath = newFileName;
    
    // Upload document if provided
    if (document) {
      const uploadedDocument = await uploadDocumentToCloudinary(
        document,
        process.env.FOLDER_NAME
      );
      updatedPolicy.document = uploadedDocument.secure_url;
    }

    const updatedData = await Policy.findByIdAndUpdate(id, updatedPolicy, { new: true });
    if (!updatedData) {
      return res.status(404).json({
        success: false,
        message: "Policy not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedData,
      message: "Policy updated successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Policy
exports.deletePolicy = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Policy ID is required.",
      });
    }

    const deletedPolicy = await Policy.findByIdAndDelete(id);
    if (!deletedPolicy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: deletedPolicy,
      message: "Policy deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
