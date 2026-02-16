const express = require("express");
const {
  createSalaryBenefits,
  getAllSalaryBenefits,
  getSalaryBenefitById,
  updateSalaryBenefit,
  deleteSalaryBenefit,
} = require("../controllers/salary/salaryBenefit");
const {
  createSalarySetup,
  getAllSalarySetup,
  getSalarySetupById,
  updateSalarySetup,
  deleteSalarySetup,
  getSalarySetupByEmployeeName,
  getSalarySetups,
  getSalaryHistory,
  getSalaryHistoryByEmployee
} = require("../controllers/salary/salarySetup");
const { getAllLOP, bulkImportLOP, updateLops, getAllLOPForLastMonth,getAllLOPByMonthAndBusinessUnit } = require("../controllers/salary/lop");

const router = express.Router();

// Salary Benefit Routes
router.post("/createSalaryBenefit", createSalaryBenefits);
router.get("/getAllSalaryBenefits", getAllSalaryBenefits);
router.get("/getSalaryBenefitById/:id", getSalaryBenefitById); // Salary Benefit Id
router.patch("/updateSalaryBenefit/:id", updateSalaryBenefit);
router.delete("/deleteSalaryBenefit/:id", deleteSalaryBenefit);

// Salary Setup Routes
router.post("/createSalarySetup", createSalarySetup);
router.get("/getAllSalarySetups", getAllSalarySetup);// With Pagination
router.get("/get-all-salarySetups", getSalarySetups) // All Salary Setups
router.get("/getSalarySetupById/:id", getSalarySetupById);
router.get("/getSalarySetupByEmployeeName/:id", getSalarySetupByEmployeeName);
router.patch("/updateSalarySetup/:id", updateSalarySetup);
router.delete("/deleteSalarySetup/:id", deleteSalarySetup);
router.get("/get-salaryHistory", getSalaryHistory)
router.get("/salary-history/employee/:employeeId", getSalaryHistoryByEmployee); // Get salary history by employee ID

// LOP Routes
router.get("/getAllLops",getAllLOP)
router.post("/importLopData",bulkImportLOP)
router.post('/updateLops', updateLops);
router.get("/getLastMonthLOP",getAllLOPForLastMonth)
router.get("/getAllLOPByMonthAndBusinessUnit",getAllLOPByMonthAndBusinessUnit)

module.exports = router;
