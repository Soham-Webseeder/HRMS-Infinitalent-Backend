const Notice = require("../../models/notice/notice");
const { uploadImageToCloudinary } = require("../../utils/imageUploader");

// Create Notice
exports.createNotice = async (req, res) => {
  try {
    let { noticeType, description, noticeDate, noticeBy } = req.body;
    const image = req.files && req.files.attachmentImageUrl;
    const uploadedImage = await uploadImageToCloudinary(
      image,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    const newNotice = await Notice.create({
      noticeType,
      description,
      noticeDate,
      attachmentImage: uploadedImage.secure_url,
      noticeBy,
    });
    await newNotice.save();
    return res.status(201).json({
      success: true,
      data: newNotice,
      message: "Notice Created Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Notice By Id
exports.getNoticeById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Id is required for fetching Notice",
      });
    }
    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: notice,
      message: "Notice Fetched Successfully...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Notices
exports.getAllNotice = async (req, res) => {
  try {
    const data = await Notice.find({});
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No Data Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: data,
      message: "All Notice Fetched...",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Notice
exports.updateNotice = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Id is required for updating Notice",
      });
    }
    const image = req.files && req.files.attachmentImageUrl;
    let { noticeType, description, noticeDate, noticeBy } = req.body;

    let updatedNotice = {
      noticeType,
      description,
      noticeDate,
      noticeBy,
    };
    if (image) {
      const uploadedImage = await uploadImageToCloudinary(
        image,
        process.env.FOLDER_NAME,
        1000,
        1000
      );
      updatedNotice.attachmentImage = uploadedImage.secure_url;
    }
    const update = await Notice.findByIdAndUpdate(id, updatedNotice, {
      new: true,
    });
    return res.status(200).json({
      success: true,
      data: update,
      message: "Notice Updated Successfully..",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Notice
exports.deleteNotice = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Id is required for updating Notice",
      });
    }
    const deletedData = await Notice.findByIdAndDelete(id);
    if (!deletedData) {
      return res.status(404).json({
        success: false,
        message: "Notice Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: deletedData,
      message: "Notice Deleted Successfully..",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
