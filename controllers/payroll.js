const Payroll = require("../models/payroll");
const Employee = require("../models/employee/employee");
const Attendance = require("../models/attendance/attendance");
const annualHolidays = require("../models/leave/annualHolidays");
const { parseDateString } = require("../utils/parseDateString");
const LeaveApplication = require("../models/leave/leaveApplication");
const { createNotification } = require("./notification");
const LOP = require("../models/salary/lop"); // Make sure to require the LOP model
const WeeklyHoliday = require("../models/leave/weeklyHoliday");
const lop = require("../models/salary/lop");
const bussinessUnit = require("../models/company/bussinessUnit");

// Fetch all Payroll entries
exports.allPayroll = async (req, res) => {
  try {
    const payrolls = await Payroll.find({})
      .populate({
        path: "employeeName",
        select: "firstName lastName email empId department phone role"
      })
      .lean();

    return res.status(200).json({
      success: true,
      data: payrolls,
      message: "Payrolls Fetched Successfully...",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a Payroll entry by ID
exports.updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;

    // We update the payroll and then populate 'employeeName' 
    // to get the combined profile and auth data (firstName, email, role, etc.)
    const updatedPayroll = await Payroll.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate({
      path: "employeeName",
      select: "firstName lastName email empId department role" // Unified fields from Employee model
    });

    if (!updatedPayroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedPayroll,
      message: "Payroll Updated Successfully...",
    });
  } catch (error) {
    console.error("Update Payroll Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Payroll entry by ID
exports.getPayrollById = async (req, res) => {
  const { id } = req.params;
  try {
    // Populate 'employeeName' to retrieve the unified Employee record 
    // linked to this payroll
    const payroll = await Payroll.findById(id).populate({
      path: "employeeName",
      select: "firstName lastName email empId department role phone photograph"
    });

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: payroll,
      message: "Payroll Fetched Successfully...",
    });
  } catch (error) {
    console.error("Get Payroll Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a Payroll entry by ID
exports.deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPayroll = await Payroll.findByIdAndDelete(id);

    const deletedLOP = await lop.findOneAndDelete({ salarySlip: id });

    if (!deletedPayroll && !deletedLOP) {
      return res.status(404).json({
        success: false,
        message: "No payroll or LOP record found with the provided ID.",
      });
    }

    return res.status(200).json({
      success: true,
      data: deletedPayroll,
      message: "Payroll and associated LOP records deleted successfully.",
    });

  } catch (error) {
    console.error("Delete Payroll Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while deleting the payroll record.",
    });
  }
};

exports.getPayslipByEmployeeId = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const payroll = await Payroll.find({ employeeName: employeeId })
      .populate({
        path: "employeeName",
        select: "firstName lastName email empId department phone photograph role"
      })
      .lean(); // Use lean for performance since this is for viewing data.

    if (!payroll || payroll.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No payslips found for this employee."
        });
    }

    return res.status(200).json({
      success: true,
      data: payroll,
      message: "Payslips fetched successfully."
    });
  } catch (error) {
    console.error("Error fetching payslip:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching payslips.",
      error: error.message
    });
  }
};

// Controller function to get payroll data
exports.getPayrollByFiscalYear = async (req, res) => {
  const { employeeId } = req.params;
  const { fiscalYear } = req.query;
  const payrollData = {};
  const startMonth = 4; // April
  const endMonth = 12; // December
  const nextYearStartMonth = 1; // January
  const nextYearEndMonth = 3; // March

  function getMonthName(index) {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return index >= 1 && index <= 12 ? monthNames[index - 1] : "Invalid month index";
  }

  try {
    // Helper to fetch and populate payroll entries
    const fetchPayroll = async (month, year) => {
      return await Payroll.findOne({
        employeeName: employeeId,
        year: year,
        month: month,
      })
        // Populates the Manager/HR who generated the slip from the Employee collection
        .populate({
          path: "payslipGeneratedBy",
          select: "firstName lastName role"
        })
        // Populates the Employee profile and their Business Unit
        .populate({
          path: 'employeeName',
          select: 'firstName lastName email empId department',
          populate: {
            path: 'businessUnit',
            select: 'name'
          }
        })
        .lean();
    };

    // 1. Fetch for April to December of current fiscal year
    for (let month = startMonth; month <= endMonth; month++) {
      const payroll = await fetchPayroll(month, fiscalYear);
      payrollData[`${getMonthName(month)} ${fiscalYear}`] = payroll;
    }

    // 2. Fetch for January to March of the next calendar year
    const nextYear = parseInt(fiscalYear) + 1;
    for (let month = nextYearStartMonth; month <= nextYearEndMonth; month++) {
      const payroll = await fetchPayroll(month, nextYear);
      payrollData[`${getMonthName(month)} ${nextYear}`] = payroll;
    }

    return res.status(200).json({
      success: true,
      data: payrollData,
    });
  } catch (error) {
    console.error("Error fetching payrolls:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch payroll data",
      error: error.message
    });
  }
};

exports.generatePayrollsOfEmployees = async (req, res) => {
  try {
    const { startDate, endDate, userID, month, year } = req.body;
    const selectedEmployees = req.body.selectedEmployees;

    // 1. Authorization: Verify the manager directly in the Employee collection
    const manager = await Employee.findById(userID);
    if (!manager || !["admin", "hr"].includes(manager.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to generate payslips."
      });
    }

    const payrollDate = new Date();
    let cycleStart, cycleEnd;
    const isFullMonth =
      Number(startDate) === 1 &&
      Number(endDate) >= 28 &&
      Number(endDate) <= 31;

    // Cycle date calculations
    if (isFullMonth) {
      const monthIndex = month - 1;
      cycleStart = new Date(Date.UTC(year, monthIndex, Number(startDate)));
      cycleEnd = new Date(Date.UTC(year, monthIndex, Number(endDate)));
    } else {
      let cycleStartMonth = month - 2;
      let cycleStartYear = year;
      if (cycleStartMonth < 0) {
        cycleStartMonth += 12;
        cycleStartYear -= 1;
      }
      cycleStart = new Date(Date.UTC(cycleStartYear, cycleStartMonth, Number(startDate)));
      cycleEnd = new Date(Date.UTC(year, month - 1, Number(endDate)));
    }

    cycleStart.setUTCHours(0, 0, 0, 0);
    cycleEnd.setUTCHours(23, 59, 59, 999);

    if (cycleStart >= cycleEnd) {
      return res.status(400).json({ success: false, message: "Invalid date range" });
    }

    const weeklyHoliday = await WeeklyHoliday.findOne();
    if (!weeklyHoliday) {
      return res.status(400).json({ success: false, message: "Weekly holiday configuration missing" });
    }

    let payrollMonth = cycleEnd.getUTCMonth() + 1;
    let payrollYear = cycleEnd.getUTCFullYear();

    // 2. Filter employees directly from the unified Employee collection
    let employees = [];
    for (const empId of selectedEmployees) {
      const existingPayroll = await Payroll.findOne({
        employeeName: empId,
        month: payrollMonth,
        year: payrollYear,
      });
      if (existingPayroll) continue;

      // Populations now target fields internal to the Employee document
      const employee = await Employee.findById(empId).populate("salarySetup");
      if (employee && !["Terminated", "Resigned"].includes(employee.employmentStatus)) {
        employees.push(employee);
      }
    }

    let data = [];

    await Promise.all(employees.map(async (employee) => {
      try {
        const timeDiff = cycleEnd - cycleStart;
        const totalWorkDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

        // Fetch attendance linked directly to Employee ID
        const attendance = await Attendance.find({ employeeName: employee._id });
        const uniqueAttendanceRecords = new Set();

        const attendanceRecord = attendance.filter((attendanceData) => {
          const parsedDate = parseDateString(attendanceData.date);
          const dateKey = parsedDate.toISOString().split("T")[0];

          if (!uniqueAttendanceRecords.has(dateKey)) {
            uniqueAttendanceRecords.add(dateKey);
            return (parsedDate >= cycleStart && parsedDate <= cycleEnd);
          }
          return false;
        });

        const presentDays = attendanceRecord.length;

        // Fetch leaves linked directly to Employee ID
        const leaveApplications = await LeaveApplication.find({
          employeeName: employee._id, // Updated reference
          leaveRequestDate: {
            $gte: cycleStart,
            $lt: cycleEnd,
          },
          status: "Approved",
          paidLeave: true,
        });

        let paidLeaveDays = 0;
        leaveApplications.forEach((lA) => { paidLeaveDays += lA.paidLeaveDays || 0; });

        const lopDays = totalWorkDays - (presentDays + paidLeaveDays);
        const absentDays = lopDays;

        const grossSalary = Number(employee.salarySetup?.grossSalary) || 0;
        const totalDeductions = Number(employee.salarySetup?.totalDeductions) || 0;

        const salaryDays = totalWorkDays - absentDays;
        let amountCredited = 0;

        if (totalWorkDays > 0 && grossSalary > 0) {
          const proratedGrossSalary = (grossSalary / totalWorkDays) * salaryDays;
          const finalAmountCredited = Math.max(0, proratedGrossSalary - totalDeductions);
          amountCredited = Math.round(finalAmountCredited);
        }

        const formattedDate = new Date().toLocaleString();

        // 3. Create Payroll document referencing unified Employee record
        const payroll = await Payroll.create({
          employeeName: employee._id,
          amountCredited,
          totalWorkDays,
          presentDays,
          absentDays,
          lopDays: String(lopDays),
          grossPay: grossSalary,
          totalPaidLeaves: paidLeaveDays,
          payrollDate,
          tds: 0,
          totalDeductions,
          dataGenerationDate: formattedDate,
          payslipGenerationDate: formattedDate,
          source: "Payroll",
          dataCreatedBy: manager.firstName, // Use manager's name from Employee doc
          payslipGeneratedBy: userID, // Link to manager's Employee ID
          lopCreatedDate: formattedDate,
          lopCreatedBy: userID,
          month: payrollMonth,
          year: payrollYear,
          pfEmployee: Math.min(employee.salarySetup?.pfEmployee || 0, 1800),
          pfEmployer: Math.min(employee.salarySetup?.pfEmployer || 0, 1800),
          esicEmployee: employee.salarySetup?.esicEmployee || 0,
          pt: employee.salarySetup?.pt || 0,
          basicSalary: employee.salarySetup?.basicSalary || 0,
          hra: employee.salarySetup?.hra || 0,
          netSalary: amountCredited,
          salaryType: "PFESI"
        });

        // 4. Create LOP Record
        const proratedGross = (grossSalary / totalWorkDays) * salaryDays;
        await LOP.create({
          employeeName: employee._id,
          annualPackage: employee.salarySetup?.annualSalary || 0,
          month: payrollMonth,
          year: payrollYear,
          lopAmount: Number((grossSalary - proratedGross).toFixed(2)) || 0,
          lopDays,
          leaves: paidLeaveDays,
          createdBy: userID,
          salarySlip: payroll._id
        });

        await createNotification(
          employee._id,
          `Your payslip for ${payrollMonth}/${payrollYear} has been generated.`,
          "Payroll"
        );

        data.push(payroll);

      } catch (error) {
        console.error(`Error processing payroll for ${employee._id}:`, error);
      }
    }));

    return res.status(200).json({
      success: true,
      data,
      message: "Payrolls generated successfully."
    });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPayrollOverview = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Fetch all payrolls for the given period
    const payrolls = await Payroll.find({ month: Number(month), year: Number(year) });

    let employeeCount = 0;
    let wageAmount = 0;
    let salaryPayout = 0;
    let taxPayment = 0;
    let pfEmployee = 0;
    let pt = 0;

    for (const pay of payrolls) {
      // Find the unified employee record linked to the payroll
      const employee = await Employee.findById(pay.employeeName).populate("salarySetup");

      if (!employee) {
        continue; // Skip if the employee record no longer exists
      }

      wageAmount += pay.amountCredited || 0;
      salaryPayout += pay.grossPay || 0;
      taxPayment += pay.tds || 0;
      employeeCount += 1;
      pfEmployee += pay.pfEmployee || 0;
      pt += pay?.pt !== null ? pay.pt : 0;
    }

    res.status(200).json({
      success: true,
      data: {
        employeeCount,
        wageAmount,
        salaryPayout,
        taxPayment,
        pfEmployee,
        pt,
      },
      message: "Payroll overview fetched successfully",
    });
  } catch (error) {
    console.error("Overview Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Generate a detailed salary sheet with business unit and department filtering
exports.getSalarySheet = async (req, res) => {
  try {
    const { month, year, department, businessUnit } = req.query;

    let businessUnitId = null;
    if (businessUnit !== "All") {
      const foundBusinessUnit = await bussinessUnit.findOne({ name: businessUnit });
      businessUnitId = foundBusinessUnit?._id?.toString();
    }

    // Fetch payrolls and populate the unified Employee record
    // Nested population of 'user' is removed as data is now merged
    const payrolls = await Payroll.find({
      month: Number(month),
      year: Number(year),
      employeeName: { $ne: null }
    }).populate({
      path: "employeeName",
      populate: { path: "salarySetup" } // Profiles and Financials are now unified
    }).lean();

    // Filter results based on unified Employee fields
    const filteredPayrolls = payrolls.filter(payroll => {
      const employeeBusinessUnit = payroll.employeeName?.businessUnit?.toString();
      const employeeDepartment = payroll.employeeName?.department;

      if (businessUnit === "All" && department === "All") return true;
      if (businessUnit === "All") return employeeDepartment === department;
      if (department === "All") return employeeBusinessUnit === businessUnitId;

      return employeeBusinessUnit === businessUnitId && employeeDepartment === department;
    });

    return res.status(200).json({
      success: true,
      data: { payrolls: filteredPayrolls },
      message: "Salary sheet generated successfully",
    });
  } catch (error) {
    console.error("Salary Sheet Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Fetch specific payroll records for an individual employee
exports.getPayrollByEmployee = async (req, res) => {
  const { employeeId } = req.params;
  const { month, year } = req.query;

  try {
    if (!month || !year) {
      return res.status(400).json({ success: false, message: "Month and year are required." });
    }

    // Search Payroll using the Employee ObjectId
    const payrollRecords = await Payroll.find({
      employeeName: employeeId,
      month: Number(month),
      year: Number(year),
    }).populate({
      path: "employeeName",
      select: "-password -otp", // Exclude sensitive auth fields
      populate: { path: "businessUnit" }
    });

    if (!payrollRecords || payrollRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No payroll records found for this employee."
      });
    }

    res.status(200).json({
      success: true,
      data: payrollRecords,
      message: "Employee payroll records fetched successfully"
    });
  } catch (error) {
    console.error("Employee Payroll Error:", error);
    res.status(500).json({ success: false, message: "Server error occurred while fetching payroll" });
  }
};

exports.bulkImportExtraPay = async (req, res) => {
  try {
    const { payrolls } = req.body;
    if (!payrolls || !Array.isArray(payrolls) || payrolls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No payroll data provided"
      });
    }

    const updatedPayrolls = await Promise.all(
      payrolls.map(async (payroll) => {
        // Populating employeeName which now refers directly to the unified Employee model
        const pay = await Payroll.findById(payroll._id).populate({
          path: "employeeName",
          select: "firstName employeeType empId" // Unified fields
        });

        if (!pay) return null;

        const newExtraPay = Number(payroll.extraPay) || 0;
        const currentExtraDeductions = Number(pay.extraDeductions) || 0;

        // --- STEP 1: CALCULATE PRORATED BASE (Handles LOP) ---
        const fullMonthlyGross = (Number(pay.basicSalary) || 0) + (Number(pay.hra) || 0) +
          (Number(pay.da) || 0) + (Number(pay.specialAllowance) || 0) +
          (Number(pay.otherAllowance) || 0);

        const divisor = Number(pay.totalWorkDays) || 30;
        const workedDays = Math.max(0, divisor - (Number(pay.absentDays) || 0));
        const proratedBase = (fullMonthlyGross / divisor) * workedDays;

        // --- STEP 2: TOTAL EARNINGS ---
        const totalEarnings = proratedBase + newExtraPay;

        // --- STEP 3: DEDUCTIONS (Statutory + Extra) ---
        let newPt = 0;
        if (pay.salaryType !== "NAPS Stipend") {
          newPt = totalEarnings >= 25000 ? 200 : 0;
        }

        const statutoryDeductions = (Number(pay.pfEmployee) || 0) + (Number(pay.esicEmployee) || 0) + newPt;
        const totalDeductions = statutoryDeductions + currentExtraDeductions;

        // --- STEP 4: FINAL NET PAY ---
        const finalNet = Math.max(0, totalEarnings - totalDeductions);

        const updatedPay = await Payroll.findByIdAndUpdate(
          payroll._id,
          {
            grossPay: fullMonthlyGross,
            amountCredited: Number(finalNet.toFixed(2)),
            netSalary: Number(finalNet.toFixed(2)),
            extraPay: newExtraPay,
            extraPayReason: payroll.extraPayReason,
            pt: newPt,
            totalDeductions: Number(totalDeductions.toFixed(2)),
          },
          { new: true }
        ).populate("employeeName");

        return {
          // Accessing unified employee fields directly
          empId: `${updatedPay.employeeName.employeeType || ""}${updatedPay.employeeName.empId || ""}`,
          name: updatedPay.employeeName.firstName,
          netSalary: updatedPay.netSalary
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: { updatedPayrolls: updatedPayrolls.filter(p => p !== null) },
      message: "Extra Pay applied successfully alongside LOP proration.",
    });
  } catch (error) {
    console.error("Bulk Extra Pay Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateCtcPayrollsOfEmployees = async (req, res) => {
  try {
    const { startDate, endDate, month, year, userID } = req.body;
    const selectedEmployees = req.body.selectedEmployees;

    // 1. Validate the manager/HR directly using the Employee collection
    const manager = await Employee.findById(userID);
    if (!manager) {
      return res.status(404).json({ success: false, message: "Authorized manager account not found." });
    }

    // Role verification using the role field in the Employee document
    if (!["admin", "hr"].includes(manager.role)) {
      return res.status(403).json({ success: false, message: "You are not authorized to generate CTC payslips." });
    }

    const payrollDate = new Date();
    let cycleStart, cycleEnd;

    const isFullMonth =
      Number(startDate) === 1 &&
      Number(endDate) >= 28 &&
      Number(endDate) <= 31;

    if (isFullMonth) {
      const monthIndex = month - 1;
      cycleStart = new Date(Date.UTC(year, monthIndex, Number(startDate)));
      cycleEnd = new Date(Date.UTC(year, monthIndex, Number(endDate)));
    } else {
      let cycleStartMonth = month - 2;
      let cycleStartYear = year;
      if (cycleStartMonth < 0) {
        cycleStartMonth += 12;
        cycleStartYear -= 1;
      }
      cycleStart = new Date(Date.UTC(cycleStartYear, cycleStartMonth, Number(startDate)));
      cycleEnd = new Date(Date.UTC(year, month - 1, Number(endDate)));
    }

    cycleStart.setUTCHours(0, 0, 0, 0);
    cycleEnd.setUTCHours(23, 59, 59, 999);

    if (cycleStart >= cycleEnd) {
      return res.status(400).json({ success: false, message: "Invalid date range" });
    }

    let payrollMonth = cycleEnd.getUTCMonth() + 1;
    let payrollYear = cycleEnd.getUTCFullYear();

    // 2. Filter employees using the unified Employee model
    let employees = [];
    for (const empId of selectedEmployees) {
      const existingPayroll = await Payroll.findOne({
        employeeName: empId,
        month: payrollMonth,
        year: payrollYear,
      });
      if (existingPayroll) continue;

      const employee = await Employee.findById(empId).populate("salarySetup");
      if (employee && !["Terminated", "Resigned"].includes(employee.employmentStatus)) {
        employees.push(employee);
      }
    }

    let data = [];

    await Promise.all(
      employees.map(async (employee) => {
        const timeDiff = cycleEnd - cycleStart;
        const totalWorkDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

        const attendance = await Attendance.find({ employeeName: employee._id });
        const uniqueAttendanceRecords = new Set();
        const attendanceRecord = attendance.filter((attendanceData) => {
          const parsedDate = parseDateString(attendanceData.date);
          const dateKey = parsedDate.toISOString().split("T")[0];
          if (!uniqueAttendanceRecords.has(dateKey)) {
            uniqueAttendanceRecords.add(dateKey);
            return (parsedDate >= cycleStart && parsedDate <= cycleEnd);
          }
          return false;
        });

        const presentDays = attendanceRecord.length;

        const leaveApplications = await LeaveApplication.find({
          employeeName: employee._id, // Updated reference
          leaveRequestDate: {
            $gte: cycleStart,
            $lt: cycleEnd,
          },
          status: "Approved",
          paidLeave: true,
        });

        let paidLeaveDays = 0;
        leaveApplications.forEach((lA) => { paidLeaveDays += lA.paidLeaveDays || 0; });

        const lopDays = totalWorkDays - (presentDays + paidLeaveDays);
        const absentDays = lopDays;

        const grossSalary = Number(employee.salarySetup?.grossSalary) || 0;
        const salaryDays = totalWorkDays - absentDays;

        const pfEmployee = Math.min(employee.salarySetup?.pfEmployee || 0, 1800);
        const pfEmployer = Math.min(employee.salarySetup?.pfEmployer || 0, 1800);
        const pt = Number(employee.salarySetup?.pt) || 0;

        const totalDeductions = pfEmployee + pt;

        let amountCredited = 0;
        if (totalWorkDays > 0 && grossSalary > 0) {
          const proratedGrossSalary = (grossSalary / totalWorkDays) * salaryDays;
          const finalAmountCredited = Math.max(0, proratedGrossSalary - totalDeductions);
          amountCredited = Number(finalAmountCredited.toFixed(2));
        }

        const formattedDate = new Date().toLocaleString();

        // 3. Create Payroll document referencing unified Employee record
        const payroll = await Payroll.create({
          employeeName: employee._id,
          amountCredited,
          totalWorkDays,
          presentDays,
          absentDays,
          lopDays: String(lopDays),
          grossPay: grossSalary,
          totalPaidLeaves: paidLeaveDays,
          payrollDate,
          tds: 0,
          totalDeductions,
          dataGenerationDate: formattedDate,
          payslipGenerationDate: formattedDate,
          source: "Payroll",
          dataCreatedBy: manager.firstName, // Access firstName from the manager's Employee record
          payslipGeneratedBy: userID, // Link to manager's Employee ID
          lopCreatedDate: formattedDate,
          lopCreatedBy: userID,
          month: payrollMonth,
          year: payrollYear,
          pfEmployee,
          pfEmployer,
          esicEmployee: Number(employee.salarySetup?.esicEmployee) || 0,
          pt,
          basicSalary: employee.salarySetup?.basicSalary || 0,
          hra: employee.salarySetup?.hra || 0,
          netSalary: amountCredited,
          cycleStartDate: cycleStart.toISOString() || "",
          cycleEndDate: cycleEnd.toISOString() || "",
          salaryType: "CTC Payroll",
        });

        await createNotification(
          employee._id,
          `Your CTC payslip for ${payrollMonth}/${payrollYear} has been generated.`,
          "Payroll"
        );

        data.push(payroll);

        // 4. Create LOP record
        const proratedGross = (grossSalary / totalWorkDays) * salaryDays;
        await LOP.create({
          employeeName: employee._id,
          annualPackage: employee.salarySetup?.annualSalary || 0,
          month: payrollMonth,
          year: payrollYear,
          lopAmount: Number((grossSalary - proratedGross).toFixed(2)) || 0,
          lopDays,
          leaves: paidLeaveDays,
          createdBy: userID,
          salarySlip: payroll._id,
        });
      })
    );

    return res.status(200).json({
      success: true,
      data,
      message: "CTC Payslips generated successfully using unified employee data.",
    });
  } catch (error) {
    console.error("Error in generateCtcPayrollsOfEmployees:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkImportExtraDeductions = async (req, res) => {
  try {
    const { payrolls } = req.body;
    if (!payrolls || !Array.isArray(payrolls) || payrolls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No deduction data provided"
      });
    }

    const updatedPayrolls = await Promise.all(
      payrolls.map(async (payroll) => {
        // Populate employeeName which now refers directly to the unified Employee model
        const pay = await Payroll.findById(payroll._id).populate({
          path: "employeeName",
          select: "firstName employeeType empId"
        });

        if (!pay) return null;

        const newExtraDeductions = Number(payroll.extraDeductions) || 0;
        const currentExtraPay = Number(pay.extraPay) || 0;

        // --- STEP 1: CALCULATE PRORATED BASE (Handles LOP) ---
        const fullMonthlyGross = (Number(pay.basicSalary) || 0) + (Number(pay.hra) || 0) +
          (Number(pay.da) || 0) + (Number(pay.specialAllowance) || 0) +
          (Number(pay.otherAllowance) || 0);

        const divisor = Number(pay.totalWorkDays) || 30;
        const workedDays = Math.max(0, divisor - (Number(pay.absentDays) || 0));
        const proratedBase = (fullMonthlyGross / divisor) * workedDays;

        // --- STEP 2: TOTAL DEDUCTIONS ---
        const statutoryDeductions = (Number(pay.pfEmployee) || 0) + (Number(pay.esicEmployee) || 0) + (Number(pay.pt) || 0);
        const totalDeductions = statutoryDeductions + newExtraDeductions;

        // --- STEP 3: FINAL NET PAY ---
        const finalNet = Math.max(0, (proratedBase + currentExtraPay) - totalDeductions);

        const updatedPay = await Payroll.findByIdAndUpdate(
          payroll._id,
          {
            amountCredited: Number(finalNet.toFixed(2)),
            netSalary: Number(finalNet.toFixed(2)),
            extraDeductions: newExtraDeductions,
            extraDeductionsReason: payroll.extraDeductionsReason,
            totalDeductions: Number(totalDeductions.toFixed(2)),
          },
          { new: true }
        ).populate("employeeName");

        return {
          // Accessing unified employee fields directly from the updated record
          empId: `${updatedPay.employeeName.employeeType || ""}${updatedPay.employeeName.empId || ""}`,
          name: updatedPay.employeeName.firstName,
          netSalary: updatedPay.netSalary
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: { updatedPayrolls: updatedPayrolls.filter(p => p !== null) },
      message: "Extra Deductions applied successfully alongside LOP proration.",
    });
  } catch (error) {
    console.error("Bulk Extra Deductions Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllExtraPayForLastMonth = async (req, res) => {
  try {
    const currentMonth = new Date().getUTCMonth();

    const payrolls = await Payroll.find({
      month: currentMonth,
    })
      .populate({
        path: "employeeName",
        select: "firstName lastName email empId employeeType department phone photograph role"
      })
      .lean();

    return res.status(200).json({
      success: true,
      data: payrolls,
      message: "Payrolls Fetched Successfully for the current month.",
    });
  } catch (error) {
    console.error("Error fetching extra pay:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching payroll data.",
    });
  }
}

exports.deleteBulkPayroll = async (req, res) => {
  try {
    const { salaryType, employeeIds, salaryCycle } = req.body;

    // 1. Parse month and year from the salaryCycle (Expected format YYYY-MM)
    const year = Number(salaryCycle.split("-")[0]);
    const month = Number(salaryCycle.split("-")[1]);

    // 2. Find and delete associated LOP (Loss of Pay) records
    // 'employeeName' in the LOP model now refers directly to the unified Employee model ID
    const deletedLOP = await lop.deleteMany({
      employeeName: { $in: employeeIds },
      month,
      year
    });

    // 3. Delete the Payroll records for the specified cycle and type
    // 'employeeName' in the Payroll model now refers directly to the unified Employee model ID
    const deletedPayroll = await Payroll.deleteMany({
      employeeName: { $in: employeeIds },
      month,
      year,
      salaryType
    });

    // 4. Check if any records were actually removed
    if (deletedPayroll.deletedCount === 0) {
      return res.status(200).json({
        success: false,
        message: "No payroll records found for the selected employees and cycle.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully deleted payroll records for ${deletedPayroll.deletedCount} employees and cleaned up associated LOP data.`,
    });

  } catch (error) {
    console.error("Error during bulk payroll deletion:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred during the bulk delete process.",
    });
  }
};

exports.getAllPayrollsByMonthAndBusinessUnit = async (req, res) => {
  try {
    const { month, year, businessUnit } = req.query;

    let businessUnitId = null;
    if (businessUnit !== "All") {
      // Find the Business Unit ID from the name
      const foundUnit = await bussinessUnit.findOne({ name: businessUnit });
      businessUnitId = foundUnit?._id?.toString();
    }

    // Fetch payrolls for the given period
    // The field 'employeeName' now refers directly to the unified Employee model
    const payrolls = await Payroll.find({
      month: Number(month),
      year: Number(year),
      employeeName: { $ne: null }
    })
      .populate({
        path: "employeeName",
        // Populates the unified Employee record and its internal salarySetup reference
        populate: { path: "salarySetup" }
      })
      .lean();

    let filteredPayrolls = [];
    if (businessUnit === "All") {
      filteredPayrolls = payrolls;
    } else {
      // Filters using the businessUnit field located directly in the Employee document
      filteredPayrolls = payrolls.filter(
        (payroll) => payroll.employeeName?.businessUnit?.toString() === businessUnitId
      );
    }

    return res.status(200).json({
      success: true,
      data: filteredPayrolls,
      message: "Payrolls for the selected business unit fetched successfully.",
    });
  } catch (error) {
    console.error("Fetch Payroll Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.generateNAPSStipendOfEmployees = async (req, res) => {
  try {
    const { startDate, endDate, month, year, userID } = req.body;
    const selectedEmployees = req.body.selectedEmployees;

    if (userID && typeof userID === 'object' && userID.id) {
      userID = userID.id;
    }

    // 1. AUTHORIZATION: Verify the manager/HR directly in the unified Employee collection
    const manager = await Employee.findById(userID);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Authorized manager account not found.",
      });
    }

    // Role verification using the role field in the Employee document
    if (!["admin", "hr", "headHr"].includes(manager.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to generate payslips",
      });
    }

    // Extract year and month from the provided date
    const payrollDate = new Date();
    let cycleStart, cycleEnd;

    const isFullMonth =
      Number(startDate) === 1 &&
      Number(endDate) >= 28 &&
      Number(endDate) <= 31;

    if (isFullMonth) {
      const monthIndex = month - 1;
      cycleStart = new Date(Date.UTC(year, monthIndex, Number(startDate)));
      cycleEnd = new Date(Date.UTC(year, monthIndex, Number(endDate)));
    } else {
      let cycleStartMonth = month - 2;
      let cycleStartYear = year;
      if (cycleStartMonth < 0) {
        cycleStartMonth += 12;
        cycleStartYear -= 1;
      }
      cycleStart = new Date(Date.UTC(cycleStartYear, cycleStartMonth, Number(startDate)));
      cycleEnd = new Date(Date.UTC(year, month - 1, Number(endDate)));
    }

    cycleStart.setUTCHours(0, 0, 0, 0);
    cycleEnd.setUTCHours(23, 59, 59, 999);

    if (cycleStart >= cycleEnd) {
      return res.status(400).json({ success: false, message: "Invalid date range" });
    }

    let payrollMonth = cycleEnd.getUTCMonth() + 1;
    let payrollYear = cycleEnd.getUTCFullYear();

    // 2. FILTER: Check for existing payrolls and non-terminated status
    let employees = [];
    for (const empId of selectedEmployees) {
      const existingPayroll = await Payroll.findOne({
        employeeName: empId,
        month: payrollMonth,
        year: payrollYear,
      });
      if (existingPayroll) continue;

      const employee = await Employee.findById(empId).populate("salarySetup");
      if (employee && !["Terminated", "Resigned"].includes(employee.employmentStatus)) {
        employees.push(employee);
      }
    }

    let data = [];
    await Promise.all(
      employees.map(async (employee) => {
        // Attendance lookup linked to Employee ID
        const attendance = await Attendance.find({
          employeeName: employee._id,
        });

        // Calculate total days in cycle
        const cycleStartDate = new Date(cycleStart);
        const cycleEndDate = new Date(cycleEnd);
        cycleStartDate.setUTCHours(0, 0, 0, 0);
        cycleEndDate.setUTCHours(0, 0, 0, 0);
        const totalDays = Math.floor((cycleEndDate - cycleStartDate) / (1000 * 60 * 60 * 24)) + 1;

        const uniqueAttendanceRecords = new Set();
        const attendanceRecord = attendance.filter((attendanceData) => {
          const parsedDate = parseDateString(attendanceData.date);
          const dateKey = parsedDate.toISOString().split("T")[0];

          if (!uniqueAttendanceRecords.has(dateKey)) {
            uniqueAttendanceRecords.add(dateKey);
            return (parsedDate >= cycleStartDate && parsedDate <= cycleEndDate);
          }
          return false;
        });

        const presentDays = attendanceRecord.length;

        // Leave lookup linked to unified Employee ID
        const leaveApplications = await LeaveApplication.find({
          employeeName: employee._id,
          leaveRequestDate: {
            $gte: cycleStartDate,
            $lt: cycleEndDate,
          },
          status: "Approved",
          paidLeave: true,
        });

        let paidLeaveDays = 0;
        leaveApplications.forEach((lA) => {
          paidLeaveDays += lA.paidLeaveDays || 0;
        });

        // 3. CALCULATION: Stipend proration and rounding
        const lopDays = totalDays - (presentDays + paidLeaveDays);
        const absentDays = lopDays;
        const grossSalary = Number(employee.salarySetup?.grossSalary) || 0;

        const dailyStipend = grossSalary / totalDays;
        const daysPaid = Math.max(0, presentDays + paidLeaveDays);
        const creditedStipendBeforeRounding = dailyStipend * daysPaid;
        const lopAmount = grossSalary - creditedStipendBeforeRounding;
        const amountCredited = Math.round(creditedStipendBeforeRounding);

        const formattedDate = new Date().toLocaleString();

        // 4. PERSISTENCE: Create Payroll record
        const payroll = await Payroll.create({
          employeeName: employee._id,
          amountCredited,
          totalWorkDays: totalDays,
          presentDays,
          absentDays,
          lopDays: String(lopDays),
          grossPay: grossSalary,
          totalPaidLeaves: paidLeaveDays,
          payrollDate: payrollDate,
          tds: 0,
          totalDeductions: 0,
          dataGenerationDate: formattedDate,
          payslipGenerationDate: formattedDate,
          source: "Payroll",
          dataCreatedBy: manager.firstName, // Manager's name from Employee doc
          payslipGeneratedBy: userID, // ID of manager/HR
          lopCreatedDate: formattedDate,
          lopCreatedBy: userID,
          month: payrollMonth,
          year: payrollYear,
          pfEmployee: 0,
          pfEmployer: 0,
          esicEmployee: 0,
          esicEmployer: 0,
          pt: 0,
          basicSalary: employee.salarySetup?.basicSalary || 0,
          hra: employee.salarySetup?.hra || 0,
          da: employee.salarySetup?.da || 0,
          specialAllowance: employee.salarySetup?.specialAllowance || 0,
          otherAllowance: employee.salarySetup?.otherAllowance || 0,
          netSalary: amountCredited,
          cycleStartDate: cycleStart.toISOString(),
          cycleEndDate: cycleEnd.toISOString(),
          salaryType: "NAPS Stipend",
        });

        await createNotification(
          employee._id,
          `Your stipend payslip for ${month}/${year} has been generated.`,
          "Payroll"
        );
        data.push(payroll);

        // 5. LOP RECORD: Generate associated LOP entry
        await LOP.create({
          employeeName: employee._id,
          annualPackage: employee.salarySetup?.annualSalary || 0,
          month: payrollMonth,
          year: payrollYear,
          lopAmount: Number(lopAmount.toFixed(2)),
          lopDays,
          createdBy: userID,
          salarySlip: payroll._id,
        });
      })
    );

    return res.status(200).json({
      success: true,
      data,
      message: "NAPS Stipend payslips generated successfully.",
    });
  } catch (error) {
    console.error("NAPS Stipend Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while generating stipends.",
    });
  }
};