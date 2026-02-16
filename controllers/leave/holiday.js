const Holiday = require("../../models/leave/holiday");

// Create a new holiday
const createHoliday = async (req, res) => {
  try {
    const { holidayName, from, to } = req.body;
    // Check if 'from' and 'to' are valid dates
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please provide dates in valid format.",
      });
    }

    // Check if 'to' is greater than 'from'
    if (toDate <= fromDate) {
      return res.status(400).json({
        success: false,
        message: "'to' date should be greater than 'from' date.",
      });
    }

    // Calculate the number of days
    const numberOfDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
    const holiday = new Holiday({ holidayName, from, to, numberOfDays });
    await holiday.save();
    return res.status(201).json({
      success: true,
      data: holiday,
      message: "Holiday Created Successfully...",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get all holidays
const getAllHolidays = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    const { name } = req.query;

    // Build the filter object
    let filter = {};
    if (name) {
      filter.holidayName = { $regex: name, $options: "i" }; // Case-insensitive search on holidayName
    }

    // Fetch holidays based on the filter and pagination
    const holidays = await Holiday.find(filter).skip(skip).limit(limit);

    const totalHolidays = await Holiday.countDocuments(filter);
    const totalPages = Math.ceil(totalHolidays / limit);
    
    if (!holidays || holidays.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Holiday Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: holidays,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalHolidays: totalHolidays,
      },
      message: "Holidays Fetched Successfully..",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// Get a specific holiday
const getHolidayById = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (holiday == null) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: holiday,
      message: "Holiday Fetched Successfully..",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update a holiday
const updateHoliday = async (req, res) => {
  try {
    const { holidayName, from, to } = req.body;
    // Calculate the number of days
    const numberOfDays = Math.ceil(
      (new Date(from) - new Date(to)) / (1000 * 60 * 60 * 24)
    );
    const holiday = await Holiday.findById(req.params.id);
    if (holiday == null) {
      return res.status(404).json({ message: "Holiday not found" });
    }
    holiday.holidayName = holidayName;
    holiday.from = from;
    holiday.to = to;
    holiday.numberOfDays = numberOfDays;
    await holiday.save();
    return res.status(200).json({
      success: true,
      data: holiday,
      message: "Holiday Updated Successfully..",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete a holiday
const deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (holiday == null) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }
    await holiday.deleteOne();
    return res.status(200).json({
      success: true,
      data: holiday,
      message: "Holiday deleted",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createHoliday,
  getAllHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
};
