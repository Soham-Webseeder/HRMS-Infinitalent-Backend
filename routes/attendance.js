const express = require("express");
const {
  createAttendance,
  getAttandanceById,
  getAttendanceByDate,
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
  getAbsenteesByDate,
  getMonthlyAbsentees,
  getAttendanceByEmployee,
  getAttendanceByEmployeeAndMonth,
  exportAttendance,
  getAttendance,
  markAttendance,
  getAllAttendances,
  getAttendanceById,
  updateAttendanceById,
  getAttendanceByDateRange,
  getAttendanceByEmployeeAndDateRange,
  createPunchOut,
  getAttendanceByEmployeeMobile,
  createPunchIn
  
} = require("../controllers/attendance/attendance");

const router = express.Router();

// Attendance Routes
router.post("/createAttendance", createAttendance);
router.get("/getAttendanceById/:id", getAttendanceById);
router.get("/getAllAttendance", getAllAttendances);
router.patch("/updateAttendance/:id", updateAttendanceById);
router.delete("/deleteAttendance/:id", deleteAttendance);
router.get("/getAttendanceByEmployee/:userId", getAttendanceByEmployee);
router.get("/getAttendanceByEmployeeMobile/:userId", getAttendanceByEmployeeMobile);
router.get("/getAttendanceByDateRange",getAttendanceByEmployeeAndDateRange)
router.patch("/createPunchOut", createPunchOut);
router.post("/createPunchIn", createPunchIn);

// router.get("/getMonthlyAbsentees", getMonthlyAbsentees);
// router.get("/exportAttendance", exportAttendance);
// router.post("/markhalfDayAttendance", markAttendance);
// router.get("/getAttendanceByDate", getAttendanceByDate);
// router.get("/getAbsenteesByDate", getAbsenteesByDate);

module.exports = router;
