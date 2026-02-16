const LOP = require("../../models/salary/lop");
const Employee = require("../../models/employee/employee"); // Assuming you have an employee model
const Payroll = require("../../models/payroll");
const bussinessUnit = require("../../models/company/bussinessUnit");

exports.getAllLOP = async (req, res) => {
  try {
    const lop = await LOP.find({}).populate(
      "employeeName",
      "firstName lastName empId"
    );
    console.log(lop);
    if (!lop) {
      return res.status(404).json({
        success: false,
        message: "LOP Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: lop,
      message: "LOP Fetched Successfully..",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.bulkImportLOP = async (req, res) => {
  try {
    const { lops } = req.body;

    if (!lops || !Array.isArray(lops) || lops.length === 0) {
      return res.status(400).json({ message: "No LOP data provided" });
    }

    const updatedLops = await Promise.all(
      lops.map(async (lop) => {
        const updateFields = {
          lopDays: lop.lopDays,
        };

        // <--- **UPDATED: Include 'leaves' in the update if it's provided in the import data**
        if (lop.leaves !== undefined) {
             updateFields.leaves = lop.leaves;
        }

        const entry = await LOP.findByIdAndUpdate(
          lop._id,
          updateFields, // Use the new updateFields object
          { new: true }
        ).populate("employeeName", "firstName lastName empId");
        if (entry) {
          return entry;
        }
      })
    );

    const updatedPayrolls = await Promise.all(
      updatedLops.map(async (lop) => {
        const payroll = await Payroll.findOne({
          employeeName: lop.employeeName?._id,
          month: lop.month,
          year: lop.year,
        }).populate({
          path: "employeeName",
          populate: { path: "salarySetup" },
        });

        if (payroll) {
          const totalCycleDays = Number(payroll.totalWorkDays) || 0; 
          
          // Get the updated leaves count from the LOP record
          const leaves = Number(lop.leaves || 0); 
          
          // --- **UPDATED: Recalculate presentDays (attendance only)** ---
          // Total Paid Days = totalCycleDays - lop.lopDays
          // Present Days (Attendance) = Total Paid Days - leaves
          const presentDays = Math.max(0, totalCycleDays - lop.lopDays - leaves);

          // Days to be paid is still: totalCycleDays - lopDays (since leaves are paid)
          const salaryDays = totalCycleDays - lop.lopDays; 
          
          const grossSalary = Number(payroll.grossPay) || 0;
          const totalDeductions = Number(payroll.totalDeductions) || 0;
          
          const amountCreditedBeforeDeductions =
            (grossSalary / totalCycleDays) * salaryDays;

          // Apply total deductions 
          const finalAmountCredited = Math.max(
            0,
            amountCreditedBeforeDeductions - totalDeductions
          );
          
          const amountCredited = Number(finalAmountCredited.toFixed(2));

          const currentDate = Date.now();
          const formattedDate = new Date(currentDate).toLocaleString();

          const updatedPayroll = await Payroll.findByIdAndUpdate(
            payroll._id,
            {
              presentDays, // <--- **UPDATED: Set to attendance days**
              amountCredited, 
              netSalary: amountCredited, 
              absentDays: lop.lopDays,
              lopDays: lop.lopDays,
              totalPaidLeaves: leaves, // <--- **UPDATED: Update the Payroll field as well**
              lopUpdatedDate: formattedDate,
            },
            { new: true }
          );

          if (updatedPayroll) {
            return updatedPayroll;
          }
        }
      })
    );

    return res.status(200).json({
      success: true,
      data: { updatedLops, updatedPayrolls },
      message: "LOP bulk import successful",
    });
  } catch (error) {
    console.error("Error during LOP import:", error);
    res
      .status(500)
      .json({
        message: error.message || "An error occurred during bulk import",
      });
  }
};

// Controller for updating LOP data
exports.updateLops = async (req, res) => {
  try {
    const { updatedLopData } = req.body;

    if (!updatedLopData || !Array.isArray(updatedLopData)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    // Iterate through each LOP data item and update it in the database
    for (const lopItem of updatedLopData) {
      const { employeeId, month, year, lopAmount, annualPackage } = lopItem;

      if (!employeeId || !month || !year) {
        continue; // Skip any incomplete data items
      }

      // Find the existing LOP record for the employee for the given month and year
      const existingLop = await LOP.findOne({ employeeId, month, year });

      if (existingLop) {
        // If LOP data exists, update it
        existingLop.lopAmount = lopAmount || existingLop.lopAmount;
        existingLop.annualPackage = annualPackage || existingLop.annualPackage;
        await existingLop.save();
      } else {
        // If LOP data does not exist, create a new record
        await LOP.create({
          employeeId,
          month,
          year,
          lopAmount,
          annualPackage,
        });
      }
    }

    res.status(200).json({ message: "LOP data updated successfully" });
  } catch (error) {
    console.error("Error updating LOP data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllLOPForLastMonth = async (req, res) => {
  try {
    const current = new Date().getUTCMonth();
    const lop = await LOP.find({ month: current }).populate(
      "employeeName",
      "firstName lastName empId"
    );

    return res.status(200).json({
      success: true,
      data: lop,
      message: "LOP Fetched Successfully...",
    });
  } catch (error) {
    // console.error("Error during LOP import:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred during bulk import",
    });
  }
};

exports.getAllLOPByMonthAndBusinessUnit = async(req,res) => {
  try {
      const { month, year,businessUnit } = req.query;
  
      let businessUnitId = {};
      if(businessUnit!=="All"){
        businessUnitId = (await bussinessUnit.findOne({name:businessUnit}))?._id?.toString();
      }
  
      const lop = await LOP.find({ 
        month, 
        year, 
        employeeName: { $ne: null }
      }).populate(
        "employeeName",
        "firstName lastName employeeType empId businessUnit"
      ).lean();
  
      let filteredLOPs = [];
      if(businessUnit==="All"){
          filteredLOPs = lop;
      }else{
        filteredLOPs = lop.filter(payroll => payroll.employeeName?.businessUnit?.toString() === businessUnitId);
      }

      return res.status(200).json({
        success: true,
        data: filteredLOPs,
        message: "",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
}
