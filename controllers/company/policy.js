const Policy = require('../../models/company/policy');
const fs = require("fs");
const path = require("path");

// Create Policy
exports.createPolicy = async (req, res) => {
  try {
    const { title, category } = req.body; // 'category' is passed from the specific UI section
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "File is required." });
    }

    const policy = await Policy.create({
      title,
      category, // Saved so we know WHICH section created it
      document: file.path.replace(/\\/g, '/')
    });

    return res.status(201).json({ success: true, data: policy });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Policy
exports.updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const file = req.file;

    let updateData = { title };

    if (file) {
      // 1. Optional: Cleanup old file to save server space
      const oldPolicy = await Policy.findById(id);
      if (oldPolicy && oldPolicy.document) {
        const oldPath = path.join(__dirname, '../../', oldPolicy.document);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // 2. Set new path
      updateData.document = file.path.replace(/\\/g, '/');
    }

    const updatedPolicy = await Policy.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedPolicy) {
      return res.status(404).json({ success: false, message: "Policy not found" });
    }

    return res.status(200).json({
      success: true,
      data: updatedPolicy,
      message: "Policy updated successfully.",
    });
  } catch (error) {
    console.error("Update Policy Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all Policies
exports.getAllPolicies = async (req, res) => {
  try {
    const { category } = req.query; // Supports ?category=HR
    const filter = category ? { category } : {};

    const policies = await Policy.find(filter);
    return res.status(200).json({ success: true, data: policies });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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
