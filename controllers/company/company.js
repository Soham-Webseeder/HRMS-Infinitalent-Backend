const Company = require("../../models/company/company");
const { uploadImageToCloudinary } = require("../../utils/imageUploader");
const Policy = require('../../models/company/policy');
const Admin = require('../../models/company/admin');
const Announcement = require('../../models/company/announcement');


exports.logo = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    const updatedProfile = await Company.create(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    );
    res.send({
      success: true,
      message: `Company Logo Updated Successfully`,
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Error while uploading the company logo", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Company
exports.updateCompany = async (req, res) => {
  const newData = req.body; // Data from the "Overview" or "Profile" page
  
  try {
    const updatedCompany = await Company.findOneAndUpdate(
      {}, // Empty filter: Finds the first (and only) document
      { $set: newData },
      { 
        new: true, 
        upsert: true, // Creates the object if the collection is empty
        runValidators: true,
        setDefaultsOnInsert: true 
      }
    );

    return res.status(200).json({
      success: true,
      message: "Company information synchronized successfully.",
      data: updatedCompany,
    });
  } catch (error) {
    console.error("Error updating company:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Company By Id
exports.getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }
    res.status(200).json({
      success: true,
      response: company,
      message: "Company fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error while getting company details",
    });
  }
};

// All Details of Company

exports.getAllData = async (req, res) => {
  console.log('API Endpoint Hit'); // Check if endpoint is hit
  try {
    const companyId = req.params.id;
    const { name } = req.query;

    const policies = await Policy.find().exec();

    const admins = await Admin.find({}).exec();

    const company = await Company.findById(companyId).exec();

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // let filter = { company: companyId };
    // if (name) {
    //   filter.para = { $regex: name, $options: "i" }; // Case-insensitive search
    // }
    const announcements = await Announcement.find()
      .exec();

    return res.status(200).json({
      success: true,
      data: {
        policies,
        admins,
        company,
        announcements,
      },
      message: "Data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({
      success: false,
      message: "Error while fetching data",
    });
  }
};
