const moment = require("moment");
const Attendance = require("../../models/attendance/attendance");
const Employee = require("../../models/employee/employee");
const LeaveApplication = require("../../models/leave/leaveApplication");
const AnnualHolidays = require("../../models/leave/annualHolidays");
const dayjs = require('dayjs');
const WeeklyHoliday = require("../../models/leave/weeklyHoliday");
const { parseDateString2 } = require("../../utils/parseDateString");

// Create Attendance
exports.createAttendance = async (req, res) => {
  try {
    const { employeeName, leaveApplication } = req.body;

    // Validate employee existence
    const employee = await Employee.findById(employeeName);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const attendanceRecord = await Attendance.findOne({ employeeName, date: req.body.date });

    // User has not Punched In
    if (attendanceRecord) {
      return res.status(201).json({
        success: false,
        message: "Employee has already Punched In",
      });
    }

    // Validate leave application existence if provided
    if (leaveApplication) {
      const leave = await LeaveApplication.findById(leaveApplication);
      if (!leave) {
        return res.status(404).json({
          success: false,
          message: "Leave application not found",
        });
      }
    }

    const attendanceData = {
      ...req.body,
      employeeName,
      leaveApplication,
    };

    const attendance = new Attendance(attendanceData);
    await attendance.save();

    res.status(201).json({
      success: true,
      response: attendance,
      message: "Attendance created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while creating attendance",
    });
  }
};

// Get Attendance By ID
exports.getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate("employeeName")
      .populate("leaveApplication");

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    res.status(200).json({
      success: true,
      response: attendance,
      message: "Attendance fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while getting attendance details",
    });
  }
};

// Get All Attendances
exports.getAllAttendances = async (req, res) => {
  try {
    const { employeeName, date } = req.query;

    // Build the filter object
    let filter = {};
    if (employeeName) {
      filter.employeeName = employeeName;
    }
    if (date) {
      filter.date = date;
    }

    const attendances = await Attendance.find(filter)
      .populate("employeeName")

    if (!attendances || attendances.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No attendances found",
      });
    }

    res.status(200).json({
      success: true,
      response: attendances,
      message: "Attendances fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching attendances",
    });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate("employeeName", "firstName lastName")
      .exec();

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance data",
    });
  }
};

//get attendace by department id and time
// exports.getAttendanceByDate = async (req, res) => {
//   try {
//     const { date, month, year } = req.query;

//     // Fetch all attendance records
//     let attendance = await Attendance.find({
//       "attendance.date": date,
//       "attendance.month": month,
//       "attendance.year": year,
//     }).populate({
//       path: "employeeName",
//       select: "firstName lastName",
//     });

//     if (!attendance) {
//       return res.status(404).json({
//         success: false,
//         message: "No Data Found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: attendance,
//       message: "Attendance Fetched Successfully.....",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.getMonthlyAbsentees = async (req, res) => {
//   try {
//     const { year, month } = req.query;

//     if (!year || !month) {
//       return res.status(400).json({
//         success: false,
//         message: "Year and month are required.",
//       });
//     }

//     // Fetch all employees
//     const allEmployees = await Employee.find({}, "firstName lastName");

//     // Get the start and end dates of the month
//     const startDate = moment(`${year}-${month}-01`).startOf("month").toDate();
//     const endDate = moment(`${year}-${month}-01`).endOf("month").toDate();

//     // Fetch attendance records for the specified month
//     const attendanceRecords = await Attendance.find({
//       "attendance.date": { $gte: startDate.getDate(), $lte: endDate.getDate() },
//       "attendance.month": month,
//       "attendance.year": year,
//     }).populate({
//       path: "employeeName",
//       select: "firstName lastName",
//     });

//     // Create a map to track absentees for each day
//     const absenteesByDate = {};

//     // Get all dates in the month
//     const datesInMonth = [];
//     for (let m = moment(startDate); m.isBefore(endDate); m.add(1, "days")) {
//       datesInMonth.push(m.format("YYYY-MM-DD"));
//     }

//     // Initialize absenteesByDate with all dates
//     datesInMonth.forEach((date) => {
//       absenteesByDate[date] = [...allEmployees];
//     });

//     // Remove present employees from the absentees list for each day
//     attendanceRecords.forEach((record) => {
//       const recordDate = moment(record.date).format("YYYY-MM-DD");
//       if (absenteesByDate[recordDate]) {
//         absenteesByDate[recordDate] = absenteesByDate[recordDate].filter(
//           (employee) =>
//             !record.employeeName ||
//             employee._id.toString() !== record.employeeName._id.toString()
//         );
//       }
//     });

//     return res.status(200).json({
//       success: true,
//       data: absenteesByDate,
//       message: "Monthly Absentees Fetched Successfully.....",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // Daily Absent

// exports.getAbsenteesByDate = async (req, res) => {
//   try {
//     const { date } = req.query;

//     // Fetch all employees
//     const allEmployees = await Employee.find({}, "firstName lastName");

//     // Fetch attendance records for the specified date
//     const attendanceRecords = await Attendance.find({ date }).populate({
//       path: "employeeName",
//       select: "firstName lastName",
//     });

//     if (!attendanceRecords || attendanceRecords.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No attendance records found for the specified date.",
//       });
//     }

//     // Create a set of employee IDs who are present
//     const presentEmployeeIds = new Set(
//       attendanceRecords
//         .filter((record) => record.employeeName !== null)
//         .map((record) => record.employeeName._id.toString())
//     );

//     // Filter out employees who are not in the set of present employees
//     const absentEmployees = allEmployees.filter(
//       (employee) => !presentEmployeeIds.has(employee._id.toString())
//     );

//     return res.status(200).json({
//       success: true,
//       data: absentEmployees,
//       message: "Absent Employees Fetched Successfully.....",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// Update Attendance By ID
exports.updateAttendanceById = async (req, res) => {
  try {
    const { employeeName, leaveApplication } = req.body;

    // Validate employee existence if provided
    if (employeeName) {
      const employee = await Employee.findById(employeeName);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }
    }

    // Validate leave application existence if provided
    if (leaveApplication) {
      const leave = await LeaveApplication.findById(leaveApplication);
      if (!leave) {
        return res.status(404).json({
          success: false,
          message: "Leave application not found",
        });
      }
    }

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    res.status(200).json({
      success: true,
      response: attendance,
      message: "Attendance updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while updating attendance",
    });
  }
};

// Delete Attendance By ID
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }
    await attendance.deleteOne();

    res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while deleting attendance",
    });
  }
};

// Parse String to Standard format for processing
function parseDateString(dateString) {
  const parts = dateString.split('-');

  if (parts.length !== 3) {
    throw new Error("Invalid date format. Use DD-MM-YYYY or YYYY-MM-DD.");
  }

  const [first, second, third] = parts.map(Number);

  // Check format: YYYY-MM-DD or DD-MM-YYYY
  if (first > 31) {
    // Assume it's YYYY-MM-DD
    return new Date(first, second, third); // Month is now 1-indexed
  } else {
    // Assume it's DD-MM-YYYY
    return new Date(third, second, first); // Month is now 1-indexed
  }
}

//fetch attendance by employee ID
exports.getAttendanceByEmployee = async (req, res) => {
  const userId = req.params.userId;
  const month = parseInt(req.query.month, 10); // Month from 1-indexed
  const year = parseInt(req.query.year, 10);

  try {
    let attendanceRecord = [];

    // Query attendance data for the specified user ID
    const attendance = await Attendance.find({ employeeName: userId }).populate(
      "employeeName",
      "firstName lastName empId"
    );

    // Validation of Month and Year
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(500).json({
        success: false,
        error: "Invalid Month or Year",
      });
    }

    // Calculate Total Working Days, Present Days, and Absent Days
    const holidays = new Set();
    const weekends = new Set();
    const date = new Date(Date.UTC(year, month - 1, 1)); // Adjusted to 0-indexed for Date object
    let lastDate = new Date(Date.UTC(year, month, 0)).getDate(); // Use month 1-indexed
    
    if(month===new Date().getMonth()+1){
      lastDate = new Date().getDate();
    }

    // Holidays given by company in that month
    const holidayDocs = await AnnualHolidays.find({
      date: { $gte: new Date(Date.UTC(year, month - 1, 1)), $lt: new Date(Date.UTC(year, month, 1)) }
    });

    holidayDocs.forEach(holiday => {
      const parsedDate = parseDateString2(holiday.date.toISOString()[0]);
      holidays.add(parsedDate);
      attendanceRecord.push({ date: parsedDate, status: holiday.event });
    });

    // Adding Weekend Days
    const dayNames = {
      0: "sunday",
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: "saturday"
    };

    const weekDays = await WeeklyHoliday.findOne();
    
    let tempDate = new Date(Date.UTC(year, month - 1, 1));
    for (let day = 1; day <= lastDate; day++) {
      tempDate = new Date(Date.UTC(year, month - 1, day));
      const dayOfWeek = tempDate.getDay();
 
      if (weekDays.isHoliday(dayNames[dayOfWeek])) {
        const parsedDate = parseDateString2(tempDate.toISOString().split('T')[0]);
        if (!holidays.has(parsedDate)) {
          weekends.add(parsedDate);
          attendanceRecord.push({
            date: parsedDate,
            status: "Weekly Off"
          });
        }
      }
    }

    // Fetch approved leave applications for the month
    const leaveApplications = await LeaveApplication.find({
      employeeId: userId,
      status: "Approved",
      // applicationEndDate: { $gte: new Date(Date.UTC(year, month - 1,1)) },
      applicationStartDate: { $lte: new Date(Date.UTC(year, month - 1, lastDate)) },
    });

    // Add leave statuses
    leaveApplications.forEach(leave => {
      const startDate = new Date(Date.UTC(
        parseInt(leave.applicationStartDate.split('-')[2]), // Year
        parseInt(leave.applicationStartDate.split('-')[1]) - 1, // Month (0-indexed)
        parseInt(leave.applicationStartDate.split('-')[0]) // Day
      ));

      const endDate = new Date(Date.UTC(
        parseInt(leave.applicationEndDate.split('-')[2]), // Year
        parseInt(leave.applicationEndDate.split('-')[1]) - 1, // Month (0-indexed)
        parseInt(leave.applicationEndDate.split('-')[0]) // Day
      ));

      for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
        const parsedDate = parseDateString2(d.toISOString().split('T')[0]);
        if (!holidays.has(parsedDate) && !weekends.has(parsedDate) && !attendanceRecord.some(record => record.date === parsedDate) && Number(parsedDate.split("-")[1])===month && Number(parsedDate.split("-")[2])===year) {
          attendanceRecord.push({ date: parsedDate, status: "Leave" });
        }
      }
    });


    // Calculating Total Days
    const totalDays = lastDate - weekends.size - holidays.size;

    // Filtering present days
    const uniqueAttendanceRecords = new Set();
    const attendanceFilter = attendance.filter(attendanceData => {
      // console.log(attendanceData.date,holidays.has(attendanceData.date),weekends.has(attendanceData.date))
      const parsedDate = parseDateString(attendanceData.date);
      const dateKey = parsedDate.toISOString().split('T')[0]; // Use the date in YYYY-MM-DD format

      // Check if the date is already in the Set
      if (!uniqueAttendanceRecords.has(dateKey)) {
        uniqueAttendanceRecords.add(dateKey); // Add the unique date to the Set
        return (
          parsedDate.getFullYear() === Number(year) &&
          parsedDate.getMonth() === Number(month) // Match 1-indexed month
        );
      }
      return false; // Skip duplicate dates
    });


    const presentDays = attendanceFilter.length;

    attendanceRecord = attendanceRecord.concat(attendanceFilter);

    // Calculating Absent Days
    const absentDays = totalDays - presentDays - leaveApplications.length; // Adjust for leave days

    tempDate = new Date(Date.UTC(year, month - 1, 1));

    for (let day = 1; day <= lastDate; day++) {
      const parsedDate = parseDateString2(tempDate.toISOString().split('T')[0]);
      if (!attendanceRecord.some(record => record.date === parsedDate)) {
        attendanceRecord.push({ date: parsedDate, status: "Absent" });
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }

    // Sort attendanceRecord by date
    attendanceRecord.sort((a, b) => {
      const dateA = parseDateString(a.date);
      const dateB = parseDateString(b.date);
      return new Date(dateA) - new Date(dateB);
    });

    const counts = attendanceRecord.reduce((acc, record) => {
      if (record.status === "Present") {
        acc.present++;
      } else if (record.status === "Absent") {
        acc.absent++;
      } else if (record.status === "Leave") {
        acc.leave++;
      }
      return acc;
    }, { present: 0, absent: 0, leave: 0 });

    res.status(200).json({
      success: true,
      data: {
        attendance: attendanceRecord,
        presentDays: counts.present,
        absentDays: counts.absent,
        leaveDays: counts.leave,
        totalDays,
      },
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching attendance data",
    });
  }
};

exports.getAttendanceByEmployeeMobile = async (req, res) => {
  const userId = req.params.userId;
  const month = parseInt(req.query.month, 10); // Month from 1-indexed
  const year = parseInt(req.query.year, 10);

  try {
    // Query attendance data for the specified user ID
    const attendance = await Attendance.find({ employeeName: userId }).populate(
      "employeeName",
      "firstName lastName empId"
    );

    // Validation of Month and Year
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(500).json({
        success: false,
        error: "Invalid Month or Year",
      });
    }

    // Calulating Total Working Days, Present Days and Absent Days
    const holidays = new Set();
    const weekends = new Set();
    const date = new Date(year, month - 1, 1); // Adjusted to 0-indexed for Date object
    const lastDate = new Date(year, month, 0).getDate(); // Use month 1-indexed

    // Holidays given by company in that month
    const holidayDocs = await AnnualHolidays.find({
      date: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) }
    });

    holidayDocs.forEach(holiday => {
      holidays.add(holiday.date.toISOString().split('T')[0]);
    });

    // Adding Weekend Days
    for (let day = 1; day <= lastDate; day++) {
      date.setDate(day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekends.add(date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
      }
    }

    // Calculating Total Days
    const totalDays = lastDate - weekends.size - holidays.size;

    // Calculating Present Days of Employee
    const uniqueAttendanceRecords = new Set();

    const attendanceRecord = attendance.filter(attendanceData => {
      const parsedDate = parseDateString(attendanceData.date);
      const dateKey = parsedDate.toISOString().split('T')[0]; // Use the date in YYYY-MM-DD format

      // Check if the date is already in the Set
      if (!uniqueAttendanceRecords.has(dateKey)) {
        uniqueAttendanceRecords.add(dateKey); // Add the unique date to the Set
        return (
          parsedDate.getFullYear() === Number(year) &&
          parsedDate.getMonth() === Number(month) // Match 1-indexed month
        );
      }
      return false; // Skip duplicate dates
    });

    const presentDays = attendanceRecord.length

    // Calculating Absent Days
    const absentDays = totalDays - presentDays;

    res.status(200).json({
      success: true,
      data: {
        attendance: attendanceRecord,
        presentDays,
        absentDays,
        totalDays
      },
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching attendance data",
    });
  }
};

exports.exportAttendance = async (req, res) => {
  try {
    const { exportType, month, year } = req.query;

    // Validate exportType
    if (!exportType || (exportType !== "monthly" && exportType !== "yearly")) {
      return res.status(400).json({ message: "Invalid export type" });
    }

    let startDate, endDate;
    if (exportType === "monthly" && month) {
      startDate = new Date(year, month - 1, 1); // month is 0-based index in JavaScript Dates
      endDate = new Date(year, month, 0); // Get last day of the month
    } else if (exportType === "yearly" && year) {
      startDate = new Date(year, 0, 1); // January 1st of the year
      endDate = new Date(year, 11, 31, 23, 59, 59, 999); // December 31st of the year
    } else {
      return res.status(400).json({ message: "Invalid export parameters" });
    }

    // Query and populate attendance data based on startDate and endDate
    const attendance = await Attendance.find({
      inTime: { $gte: startDate, $lte: endDate },
    }).populate({
      path: "employeeName",
      select: "firstName lastName",
    });

    // Handle no data found case
    if (!attendance || attendance.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Data Found",
      });
    }

    // Format the data into CSV or other desired format
    const formattedAttendance = attendance.map((record) => {
      return {
        Employee: `${record.employeeName.firstName} ${record.employeeName.lastName}`,
        Date: record.inTime,
        InTime: record.inTime,
        OutTime: record.outTime,
        Department: record.department,
        Attendance: record.attendance.filter(
          (day) =>
            day.date >= startDate.getDate() && day.date <= endDate.getDate()
        ),
      };
    });

    // Respond with formatted attendance data
    res.status(200).json({
      success: true,
      data: formattedAttendance,
      message: `Attendance fetched for ${exportType} export successfully`,
    });
  } catch (error) {
    console.error("Error exporting attendance:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Half-Day Mark
exports.markAttendance = async (req, res) => {
  const { date, month, year, absentEmployees } = req.body;

  try {
    // Find all employees except the ones who are absent
    const presentEmployees = await Employee.find({
      _id: { $nin: absentEmployees },
    });

    // Mark absent employees
    await Attendance.updateMany(
      {
        employee: { $in: absentEmployees },
        "attendance.date": date,
        "attendance.month": month,
        "attendance.year": year,
      },
      {
        $set: { "attendance.$.checked": false },
      }
    );

    // Mark present employees
    await Attendance.updateMany(
      {
        employee: { $in: presentEmployees.map((emp) => emp._id) },
        "attendance.date": date,
        "attendance.month": month,
        "attendance.year": year,
      },
      {
        $set: { "attendance.$.checked": true },
      }
    );

    res.status(200).json({ message: "Attendance marked successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Attendance by date range
exports.getAttendanceByEmployeeAndDateRange = async (req, res) => {
  const { employeeId, startDate, endDate } = req.query;

  try {
    // Convert dates to the correct format
    const start = dayjs(startDate).startOf('day').toISOString();
    const end = dayjs(endDate).endOf('day').toISOString();

    // Fetch attendance records for the specific employee within the date range
    const attendanceRecords = await Attendance.find({
      employeeName: employeeId, // Filter by employee ID
      date: {
        $gte: start,
        $lte: end
      }
    }).populate('employeeName', "firstName lastName"); // Populate employee details if needed

    res.status(200).json({ success: true, data: attendanceRecords });
  } catch (error) {
    console.error("Error fetching attendance by employee and date range:", error);
    res.status(500).json({ success: false, message: "Failed to fetch attendance data" });
  }
};

// Function to parse time strings and calculate the difference
function calculateWorkingHours(inTime, outTime) {

  // Function to parse a time string in the format "HH:MM AM/PM"
  function parseTime(timeStr) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return new Date(0, 0, 0, hours, minutes, 0, 0); // Return date with hours and minutes set
  }

  // Parse the inTime and outTime
  const start = parseTime(inTime);
  const end = parseTime(outTime);

  // Calculate the difference in milliseconds
  const diffMs = end - start;

  // Convert milliseconds to hours and minutes
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${diffHours}:${diffMinutes}`
}

exports.createPunchOut = async (req, res) => {
  try {
    const { employeeName, date, outTime, breakDuration, overTime } = req.body;

    // Invalid request parameters
    if (!employeeName && !date) {
      return res.status(404).json({
        success: false,
        message: "Enter Valid Data",
      });
    }

    const attendance = await Attendance.findOne({ employeeName, date });

    // User has not Punched In
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Employee has not Punched In",
      });
    }

    // Calculate the Working Hours => difference between inTime and outTime
    const workingHours = calculateWorkingHours(attendance.inTime, outTime);

    const updatedAttendance = await Attendance.updateOne({ employeeName, date }, { outTime, breakDuration, overTime, workingHours }, { new: true });

    // Record does not exists
    if (!updatedAttendance) {
      return res.status(500).json({
        success: false,
        message: "Failed to Punch Out. Please try again.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Punched Out successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to Punch Out. Please try again.",
    });
  }
}

exports.createPunchIn = async (req, res) => {
  try {
    const { employeeName, date, inTime } = req.body;

    // Validate request parameters
    if (!employeeName || !date || !inTime) {
      return res.status(400).json({
        success: false,
        message: "Enter Valid Data",
      });
    }

    // Check if attendance already exists for the given date
    const existingAttendance = await Attendance.findOne({ employeeName, date });

    // If attendance exists, return an error
    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: "Employee has already punched in today",
      });
    }

    // Create new attendance record
    const attendance = new Attendance({
      employeeName,
      date,
      inTime,
      // Initialize other fields if necessary
    });

    await attendance.save();

    return res.status(201).json({
      success: true,
      message: "Punched In successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to Punch In. Please try again.",
    });
  }
};