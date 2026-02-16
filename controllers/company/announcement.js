const Announcement = require("../../models/company/announcement");
const Company = require("../../models/company/company");

// Create Announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const announcementData = {
      company: companyId,
      ...req.body,
    };

    const announcement = new Announcement(announcementData);
    await announcement.save();

    company.announcements.push(announcement._id);
    await company.save();

    res.status(201).json({
      success: true,
      response: announcement,
      message: "Announcement created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while creating announcement",
    });
  }
};

// Get All Announcement
exports.getAllAnnouncements = async (req, res) => {
  try {
    const companyId = req.params.id;
    const { name } = req.query;

    if (!companyId) {
      return res.status(404).json({
        success: false,
        message: "Company Not Found",
      });
    }

    // Build the filter object
    let filter = { company: companyId };
    if (name) {
      filter.title = { $regex: name, $options: "i" }; // Case-insensitive search
    }

    const announcements = await Announcement.find(filter)
      .populate("company")
      .select("-company");

    if (!announcements || announcements.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No announcements found",
      });
    }

    res.status(200).json({
      success: true,
      response: announcements,
      message: "Announcements fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching announcements",
    });
  }
};


// Get Announcement By Id
exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }
    res.status(200).json({
      success: true,
      response: announcement,
      message: "Announcement fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while getting announcement details",
    });
  }
};

// Update Announcement
exports.updateAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }
    res.status(200).json({
      success: true,
      response: announcement,
      message: "Announcement updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while updating announcement",
    });
  }
};

// Delete Announcement
exports.deleteAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }
    await announcement.deleteOne();
    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while deleting announcement",
    });
  }
};


exports.getAnnouncements = async(req,res)=>{
  try {

    const announcements = await Announcement.find({})

    if (!announcements || announcements.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No announcements found",
      });
    }

    res.status(200).json({
      success: true,
      response: announcements,
      message: "Announcements fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching announcements",
    });
  }
}
