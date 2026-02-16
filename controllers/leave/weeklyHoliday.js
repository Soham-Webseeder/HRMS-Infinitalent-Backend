const WeeklyHoliday = require("../../models/leave/weeklyHoliday");

//  create a  weekly holiday
exports.createWeeklyHoliday = async (req, res) => {
  const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } =
    req.body;

  try {
    const newWeeklyHoliday = new WeeklyHoliday({
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
    });

    await newWeeklyHoliday.save();

    res.status(201).json({
      success: true,
      data: newWeeklyHoliday,
      message: "Weekly Holiday Created Successfully...",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//  get all weekly holidays
exports.getAllWeeklyHolidays = async (req, res) => {
  try {
    const weeklyHolidays = await WeeklyHoliday.find({});
    if (!weeklyHolidays) {
      return res.status(404).json({
        success: false,
        message: "No Data Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: weeklyHolidays,
      message: "Weekly Holidays Fetched Successfully...",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get weekly holiday by ID
exports.getWeeklyHolidayById = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(401).json({
      success: false,
      message: "Id is required for Fetching Weekly Holiday",
    });
  }
  try {
    const weeklyHoliday = await WeeklyHoliday.findById(id);
    if (!weeklyHoliday) {
      return res.status(404).json({
        success: false,
        message: "No Weekly Holiday Found",
      });
    }
    res.status(200).json({
      success: true,
      data: weeklyHoliday,
      message: "Weekly Holiday Fetched",
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// update a weekly holiday by ID
exports.updateWeeklyHoliday = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(401).json({
      success: false,
      message: "Id is required for Updating Weekly Holiday",
    });
  }
  const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } =
    req.body;

  try {
    const updatedWeeklyHoliday = await WeeklyHoliday.findByIdAndUpdate(
      id,
      {
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        sunday,
      },
      { new: true }
    );

    if (!updatedWeeklyHoliday) {
      return res.status(404).json({
        success: false,
        message: "Weekly holiday not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedWeeklyHoliday,
      message: "Weekly Holiday Updated Successfully...",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// delete a weekly holiday by ID
exports.deleteWeeklyHoliday = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(401).json({
      success: false,
      message: "Id is required for Deleting Weekly Holiday",
    });
  }
  try {
    const deletedWeeklyHoliday = await WeeklyHoliday.findByIdAndDelete(id);
    if (!deletedWeeklyHoliday) {
      return res.status(404).json({
        success: false,
        message: "Weekly holiday not found",
      });
    }
    return res.json({
      success: true,
      data: deletedWeeklyHoliday,
      message: "Weekly holiday deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
