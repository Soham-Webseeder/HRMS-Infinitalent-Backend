const express = require('express');
const { getReportByMonthAndYear, sendEmployeeMasterReportByMail, sendEmployeeExitReportByMail } = require('../controllers/report/report');


const router = express.Router();

router.get("/getReportByMonthAndYear",getReportByMonthAndYear);
router.post("/sendEmployeeMasterReportByMail",sendEmployeeMasterReportByMail);
router.post("/sendEmployeeExitReportByMail",sendEmployeeExitReportByMail);

module.exports = router;