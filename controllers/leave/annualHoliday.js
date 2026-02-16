const AnnualHoliday = require("../../models/leave/annualHolidays");

// create Annual Holiday
exports.createAnnualHoliday = async (req, res) => {
  try {
    const holiday = new AnnualHoliday(req.body);
    await holiday.save();

    return res.status(200).json({
      success: true,
      data: holiday,
      message: "Annual holiday created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get All Annual Holidays
exports.getAllAnnualHolidays = async (req, res) => {
    try {
      const holidays = await AnnualHoliday.find({});
      return res.status(200).json({
        success: true,
        data: holidays,
        message: "All annual holidays fetched successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  exports.getAnnualHolidayById = async (req, res) => {
    try {
      const { id } = req.params;
      const holiday = await AnnualHoliday.findById(id);
  
      if (!holiday) {
        return res.status(404).json({
          success: false,
          message: "Annual holiday not found",
        });
      }
  
      return res.status(200).json({
        success: true,
        data: holiday,
        message: "Annual holiday fetched successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  
  exports.updateAnnualHoliday = async (req, res) => {
    try {
      const id  = req.params.id;
      const updatedHoliday = await AnnualHoliday.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );
  
      if (!updatedHoliday) {
        return res.status(404).json({
          success: false,
          message: "Annual holiday not found",
        });
      }
  
      return res.status(200).json({
        success: true,
        data: updatedHoliday,
        message: "Annual holiday updated successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  exports.deleteAnnualHoliday = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedHoliday = await AnnualHoliday.findByIdAndDelete(id);
  
      if (!deletedHoliday) {
        return res.status(404).json({
          success: false,
          message: "Annual holiday not found",
        });
      }
  
      return res.status(200).json({
        success: true,
        data: deletedHoliday,
        message: "Annual holiday deleted successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  