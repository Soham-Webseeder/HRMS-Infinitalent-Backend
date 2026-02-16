const mongoose = require("mongoose");
const Attendance = require("../models/attendance/attendance");
const LeaveApplication = require("../models/leave/leaveApplication");
const Employee = require("../models/employee/employee");
const Department = require("../models/company/department");


exports.getDashboardData = async (req, res) => {
  try {
    // Helper to get MM-DD format for string comparisons
    const getMMDD = (offset = 0) => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      return `${("0" + (d.getMonth() + 1)).slice(-2)}-${("0" + d.getDate()).slice(-2)}`;
    };

    const todayMMDD = getMMDD(0);
    const yesterdayMMDD = getMMDD(-1);
    const tomorrowMMDD = getMMDD(1);

    // For Attendance (which likely uses YYYY-MM-DD)
    const todayFull = new Date().toISOString().split('T')[0];

    // 1. Total Employees
    const totalEmployees = await Employee.countDocuments({ employmentStatus: "Active" });

    // 2. Attendance Stats (Corrected field: employeeName)
    const attendanceDataToday = await Attendance.aggregate([
      { $match: { date: todayFull } },
      {
        $group: {
          _id: null,
          present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } }
        }
      }
    ]);

    const presentCount = attendanceDataToday.length > 0 ? attendanceDataToday[0].present : 0;
    const absentCount = Math.max(totalEmployees - presentCount, 0);

    const leaveData = await LeaveApplication.aggregate([
      {
        $lookup: {
          from: "leavetypes", // Ensure this matches your LeaveType collection name
          localField: "leaveType",
          foreignField: "_id",
          as: "typeInfo"
        }
      },
      { $unwind: { path: "$typeInfo", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          sickLeaveCount: {
            $sum: { $cond: [{ $eq: ["$typeInfo.name", "Sick Leave"] }, 1, 0] }
          },
          totalLeaveCount: { $sum: 1 }
        }
      }
    ]);

    // 4. Leave Requests with Employee Details (Corrected localField: employeeId)
    const leaveRequests = await LeaveApplication.aggregate([
      {
        $lookup: {
          from: "employees", // The default plural collection name for the Employee model
          localField: "employeeId",
          foreignField: "_id",
          as: "empDetails"
        }
      },
      { $unwind: "$empDetails" },
      {
        $project: {
          _id: 1,
          status: 1,
          leaveType: 1,
          startDate: "$applicationStartDate",
          endDate: "$applicationEndDate",
          reason: 1,
          empId: "$empDetails.empId", // Pulls the custom employee ID from Employee model
          fullName: {
            $concat: [
              "$empDetails.firstName",
              " ",
              { $ifNull: ["$empDetails.middleName", ""] }, // Added middleName support
              { $cond: [{ $eq: ["$empDetails.middleName", ""] }, "", " "] },
              { $ifNull: ["$empDetails.lastName", ""] }
            ]
          }
        }
      },
      { $sort: { createdAt: -1 } }, // Shows newest requests first
      { $limit: 10 } // Limits dashboard view to top 10
    ]);

    // 5. Birthdays (Handling the String 'dateOfBirth' field)
    const birthdayEmployees = await Employee.find({
      $expr: {
        $in: [
          { $substr: ["$dateOfBirth", 5, 5] }, // Assumes YYYY-MM-DD
          [todayMMDD, yesterdayMMDD, tomorrowMMDD]
        ]
      }
    }).select("firstName lastName dateOfBirth");

    // 6. Anniversaries (Corrected field: hireDate instead of startDate)
    const anniversaryEmployees = await Employee.find({
      $expr: {
        $in: [
          { $substr: ["$hireDate", 5, 5] },
          [todayMMDD, yesterdayMMDD, tomorrowMMDD]
        ]
      }
    }).select("firstName lastName hireDate");

    const departments = await Department.find();

    res.status(200).json({
      attendance: {
        totalPresent: presentCount,
        totalAbsent: absentCount,
      },
      leaveCounts: leaveData[0] || { sickLeaveCount: 0, totalLeaveCount: 0 },
      leaveRequests,
      birthdays: birthdayEmployees,
      anniversaries: anniversaryEmployees,
      totalEmployees,
      departments,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

exports.getByEmployeeIdOrName = async (req, res) => {
  try {
    const { param } = req.params;
    let query;

    // Check if param is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(param)) {
      // Handle by employeeID (MongoDB ObjectId)
      query = { _id: new mongoose.Types.ObjectId(param) };
    } else {
      // Handle by full name, using regular expressions
      const searchString = param.trim();
      const regex = new RegExp(searchString, "i");

      query = {
        $or: [
          { firstName: regex },
          { middleName: regex },
          { lastName: regex },
          {
            $expr: {
              $regexMatch: {
                input: {
                  $concat: [
                    { $ifNull: ["$firstName", ""] },
                    " ",
                    { $ifNull: ["$middleName", ""] },
                    " ",
                    { $ifNull: ["$lastName", ""] },
                  ],
                },
                regex: regex,
              },
            },
          },
        ],
      };
    }

    // Find employees based on the query
    const data = await Employee.find(query);
    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No employees found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.getPunchStatusByDepartmentAndDate = async (req, res) => {
  try {
    const { department, date } = req.query;

    if (!date) {
      return res.status(404).json({
        success: false,
        message: "Date is required",
      });
    }

    let employeesInDepartment;
    let totalActiveEmployees;
    let punchedIn;
    let punchedOut;

    // Case 1: If a department is specified, filter by that department
    if (department) {
      // Fetch employees in the specified department
      employeesInDepartment = await Employee.find({ department }).select('_id');
      const employeeIds = employeesInDepartment.map(employee => employee._id);

      // Total active employees in the specified department
      totalActiveEmployees = employeeIds.length;

      // Count punched in employees from the specified department
      punchedIn = await Attendance.countDocuments({
        date,
        employeeName: { $in: employeeIds },
      });

      // Count punched out employees from the specified department
      punchedOut = await Attendance.countDocuments({
        date,
        employeeName: { $in: employeeIds },
        outTime: { $exists: true, $ne: "", $type: "string" },
      });
    }
    // Case 2: If no department is specified, get data for all departments
    else {
      // Fetch all employees
      employeesInDepartment = await Employee.find().select('_id');
      const allEmployeeIds = employeesInDepartment.map(employee => employee._id);

      // Total active employees across all departments
      totalActiveEmployees = allEmployeeIds.length;

      // Count punched in employees across all departments
      punchedIn = await Attendance.countDocuments({
        date,
        employeeName: { $in: allEmployeeIds },
      });

      // Count punched out employees across all departments
      punchedOut = await Attendance.countDocuments({
        date,
        employeeName: { $in: allEmployeeIds },
        outTime: { $exists: true, $ne: "", $type: "string" },
      });
    }

    // Ensure notPunchedIn is non-negative
    const notPunchedIn = Math.max(totalActiveEmployees - punchedIn, 0);

    return res.status(200).json({
      success: true,
      data: {
        totalActiveEmployees,
        punchedIn,
        punchedOut,
        notPunchedIn,
      },
      message: "Punch Status fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

