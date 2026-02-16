const express = require("express");
const router = express.Router();
const { getDashboardData, getByEmployeeIdOrName, getPunchStatusByDepartmentAndDate} = require("../controllers/dashboard");

// Route to get dashboard data
router.get("/getDashboardData", getDashboardData);
router.get("/getByEmployeeIdOrName/:param", getByEmployeeIdOrName);
router.get("/getPunchStatusByDepartmentAndDate", getPunchStatusByDepartmentAndDate);

module.exports = router;