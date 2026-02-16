const express = require("express");
const {
  createWeeklyHoliday,
  getAllWeeklyHolidays,
  getWeeklyHolidayById,
  updateWeeklyHoliday,
  deleteWeeklyHoliday,
} = require("../controllers/leave/weeklyHoliday");
const {
  createLeaveType,
  getAllLeaveType,
  getLeaveTypeById,
  updateLeaveType,
  deleteLeaveType,
} = require("../controllers/leave/leaveType");
const {
  createHoliday,
  getAllHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
} = require("../controllers/leave/holiday");
const {
  createLeaveApplication,
  getLeaveApplicationById,
  getAllLeaveApplications,
  updateLeaveApplication,
  deleteLeaveApplication,
  getLeaveApplicationsByEmployee,
  getLeaveApplications,
} = require("../controllers/leave/leaveApplication");
const { createAnnualHoliday, getAllAnnualHolidays, getAnnualHolidayById, updateAnnualHoliday, deleteAnnualHoliday } = require("../controllers/leave/annualHoliday");
const router = express.Router();

// Weekly Holidays Routes
router.post("/createWeeklyHoliday", createWeeklyHoliday);
router.get("/getAllWeeklyHolidays", getAllWeeklyHolidays);
router.get("/getWeeklyHolidayById/:id", getWeeklyHolidayById);
router.patch("/updateWeeklyHoliday/:id", updateWeeklyHoliday);
router.delete("/deleteWeeklyHoliday/:id", deleteWeeklyHoliday);

// Holiday Routes
router.post("/createHoliday", createHoliday);
router.get("/getAllHolidays", getAllHolidays);
router.get("/getHolidayById/:id", getHolidayById);
router.patch("/updateHoliday/:id", updateHoliday);
router.delete("/deleteHoliday/:id", deleteHoliday);

// Leave Type Routes
router.post("/createLeaveType", createLeaveType);
router.get("/getAllLeaveType", getAllLeaveType);
router.get("/getLeaveTypeById/:id", getLeaveTypeById);
router.patch("/updateLeaveType/:id", updateLeaveType);
router.delete("/deleteLeaveType/:id", deleteLeaveType);

// Leave Application Routes
router.post("/createLeaveApplication", createLeaveApplication);
router.get("/getLeaveApplicationById/:id", getLeaveApplicationById);
router.get("/getAllLeaveApplications", getAllLeaveApplications);
router.get("/getLeaveApplications", getLeaveApplications);

router.patch("/updateLeaveApplication/:id", updateLeaveApplication);
router.delete("/deleteLeaveApplication/:id", deleteLeaveApplication);
router.get('/getLeaveApplicationsByEmployee/:userId', getLeaveApplicationsByEmployee);

// Annual Holidays Routes

router.post("/createAnnualHoliday", createAnnualHoliday);
router.get("/getAllAnnualHoliday", getAllAnnualHolidays);
router.get("/getAnnualHolidayById/:id", getAnnualHolidayById);
router.patch("/updateAnnualHoliday/:id", updateAnnualHoliday);
router.delete("/deleteAnnualHoliday/:id", deleteAnnualHoliday);

module.exports = router;
