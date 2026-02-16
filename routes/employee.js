const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

const {
  createPosition,
  getAllPositions,
  updatePosition,
  deletePosition,
  getPositionById,
} = require("../controllers/employee/position");
const {
  createEmployee,
  bulkImportEmployees,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployee,
  getEmployeesForExport,
  updateEmploymentStatus,
  updateProfile,
  getEmployeesByAudienceGroup,
  checkEmail,
  checkUserEmail,
  updateUserRole,
  updateUserRoleByEmployeeId,
  getAllEmployeesWithRole,
  empIdExists,
  getTerminatedOrResignedEmployees,
  getExEmployee,
  getAllEmployeesByPayroll,
  logLocation
} = require("../controllers/employee/employee");

const {
  createEmployeePerformance,
  getEmployeePerformanceById,
  getAllEmpPerformance,
  updateEmployeePerformance,
  deleteEmployeePerformance,
  getEmployeePerformances,
  getAllEmpPerformanceByMonthAndYear,
} = require("../controllers/employee/employeePerformance");

const {
  createResignation,
  updateResignationStatus,
  getAllResignations,
} = require("../controllers/employee/employeeResignation");
const {
  getAllEmployeeChangeRequest,
  getAllEmployeeChangeRequestByEmployeeName,
  getAllEmployeeChangeRequestById,
  updateEmployeeChangeRequestStatusById,
  deleteChangeRequest,
} = require("../controllers/employee/employeeChangeRequest");

// Position Routes
router.post("/createPosition", createPosition);
router.get("/getAllPostions", getAllPositions);
router.patch("/updatePosition/:id", updatePosition);
router.delete("/deletePosition/:id", deletePosition);
router.get("/getPositionById/:id", getPositionById);

// Employee Routes
router.post("/createEmployee", upload.any(),createEmployee);
router.get("/checkUserEmail",checkUserEmail);
router.post("/importEmployees/:businessUnitName", upload.single("file"), bulkImportEmployees);
router.get("/getAllEmployees", getAllEmployees); // Employees with pagination
router.get("/get-employees", getEmployee); // all Employee
router.get("/get-employees-for-export", getEmployeesForExport); // all Employee for export
router.get("/getEmployeeById/:id", getEmployeeById);
router.patch("/updateEmployee/:id", upload.any(),updateEmployee);
router.patch("/updateProfile/:id", upload.any() ,updateProfile);
router.delete("/deleteEmployee/:id", deleteEmployee);
router.patch("/updateEmploymentStatus/:id", updateEmploymentStatus);
router.get(
  "/getEmployeesByAudienceGroup/:audienceGroup",
  getEmployeesByAudienceGroup
);
router.get("/get-ex-employees", getTerminatedOrResignedEmployees)
router.get("/checkEmail", checkEmail);
// Update User Role Route
router.patch("/updateUserRole/:id", updateUserRoleByEmployeeId);
router.get("/empIdExists", empIdExists);

// Employee Performance Routes
router.post("/createEmployeePerformance", createEmployeePerformance);
router.get("/getEmployeePerformanceById/:id", getEmployeePerformanceById);
router.get("/getAllEmpPerformance", getAllEmpPerformance); // Employee Performance with pagination
router.get(
  "/getAllEmpPerformanceByMonthAndYear",
  getAllEmpPerformanceByMonthAndYear
);
router.get("/get-all-performances", getEmployeePerformances);
router.patch("/updateEmpPerformance/:id", updateEmployeePerformance);
router.delete("/deleteEmpPerformance/:id", deleteEmployeePerformance);
router.get("/getAllEmployeesWithRole", getAllEmployeesWithRole)

//EmployeeResignation Routes
router.post("/createEmployeeResignation", createResignation);
router.patch("/updateEmployeeResignation/:id", updateResignationStatus);
router.get("/getAllEmployeeResignation", getAllResignations);

// Employee Details Change Request Routes

router.get("/getAllEmployeeChangeRequest", getAllEmployeeChangeRequest);
router.get(
  "/getAllEmployeeChangeRequestByEmployeeName/:id",
  getAllEmployeeChangeRequestByEmployeeName
);
router.get(
  "/getAllEmployeeChangeRequestById/:id",
  getAllEmployeeChangeRequestById
);
router.patch(
  "/updateEmployeeChangeRequestStatusById",
  updateEmployeeChangeRequestStatusById
);
router.delete("/deleteChangeRequest/:id", deleteChangeRequest);
router.get("/getAllEmployeesByPayroll", getAllEmployeesByPayroll);

// Geofence Routes
router.post("/location/:id", logLocation);

module.exports = router;
