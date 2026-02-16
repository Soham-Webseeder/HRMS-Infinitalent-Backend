const express = require("express");
const router = express.Router();

const { createPayroll, allPayroll, getPayrollById, updatePayroll, deletePayroll, generateAllPayrolls, getPayslipByEmployeeName, getPayslipByEmployeeId, getPayrollByFiscalYear, generatePayrollsOfEmployees, getPayrollOverview, getSalarySheet, generateNAPSStipendOfEmployees, getPayrollByEmployee, bulkImportExtraPay, generateCtcPayrollsOfEmployees, bulkImportExtraDeductions, getAllExtraPayForLastMonth, deleteBulkPayroll, getAllPayrollsByMonthAndBusinessUnit } = require("../controllers/payroll");

router.get("/allPayroll", allPayroll)
router.get("/getPayrollById/:id", getPayrollById)
router.patch("/updatePayroll/:id", updatePayroll);
router.delete("/deletePayroll/:id", deletePayroll);
router.get("/getPayslipByEmployee/:id", getPayslipByEmployeeId);
router.get('/getPayrollByFiscalYear/:employeeId', getPayrollByFiscalYear);
router.post("/generatePayrollsOfEmployees",generatePayrollsOfEmployees);
router.get("/getPayrollOverview",getPayrollOverview);
router.get("/getSalarySheet",getSalarySheet);
router.post("/generateNAPSStipendOfEmployees",generateNAPSStipendOfEmployees);
router.post("/generateCtcPayrollOfEmployees",generateCtcPayrollsOfEmployees);
router.get("/getPayrollByEmployee/:employeeId", getPayrollByEmployee);
router.post("/importExtraPayData",bulkImportExtraPay);
router.post("/importExtraDeductionsData",bulkImportExtraDeductions);
router.get("/getAllExtraPayForLastMonth",getAllExtraPayForLastMonth);
router.post("/deleteBulkPayroll",deleteBulkPayroll);
router.get("/getAllPayrollsByMonthAndBusinessUnit",getAllPayrollsByMonthAndBusinessUnit);
module.exports = router;