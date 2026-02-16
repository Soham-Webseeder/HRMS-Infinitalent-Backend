const bussinessUnit = require("../../models/company/bussinessUnit");
const Employee = require("../../models/employee/employee");
const payroll = require("../../models/payroll");
const { createEmployeeMaster, createEmployeeExit } = require("../../utils/excelGenerator");
const { transporter } = require("../../utils/transporter");
const Resignation = require("../../models/employee/employeeresignation");


exports.getReportByMonthAndYear = async(req,res) => {
    try {
        const {month,year} = req.query;
    //     const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 5;
    // const skip = (page - 1) * limit;

        const payrolls = await payroll.find({month,year})
            // .skip(skip)
            // .limit(limit)
            .populate({
                    path: 'employeeName',
                    populate: [{ path: 'salarySetup' },,
                        { path: 'businessUnit' }]
                  });

        // const totalPayrolls = await payroll.countDocuments({month,year});
        // const totalPages = Math.ceil(totalPayrolls / limit);

        const businessUnits = await bussinessUnit.find({})


        return res.status(200).json({
            success:true,
            data: {
                payrolls,
                businessUnits:businessUnits?.map(unit => unit.name)
            },
            // pagination: {
            //     currentPage: page,
            //     totalPages: totalPages,
            //     totalPayrolls: totalPayrolls,
            //   },
            message:""
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.sendEmployeeMasterReportByMail = async (req,res) => {
    try {

        const {employeeIds,receivers} = req.body;

        const employees = await Employee.find({_id:{$in:employeeIds}}).populate("businessUnit","name").lean();

        const filePath = createEmployeeMaster(employees);

        console.log("Sending Mails ....")
        for(const mail of receivers){
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: mail,
                subject: 'Employee Master Report',
                text: 'Please find attached the list of employees.',
                attachments: [
                    {
                        filename: 'employee_master.xlsx',
                        path: filePath,
                    },
                ],
              };
        
            await transporter.sendMail(mailOptions);
        }

        console.log("Sent")

        return res.status(200).json({
            success:true,
            message:"Mail sent successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.sendEmployeeExitReportByMail = async (req,res) => {
    try {

        const {employeeIds,receivers} = req.body;

        // const employees = await Resignation.find({employeeId:{$in:employeeIds},isResigned:true}).populate({path:"employeeId",populate:[{path:"businessUnit"},{path:"employmentStatus",match:{ status: { $in: ["Resigned", "Terminated"] } }}]}).lean();

        // console.log(employeeIds)

        const employees = await Employee.find({_id:{$in:employeeIds},}).populate("businessUnit").lean();        // console.log(employees?.map(e => ({id:e._id,empstatus:e.employmentStatus})))

        let data = []

        for (const emp of employees) {
            const resignation = await Resignation.findOne({ employeeId: emp._id });

            const d = {
                employeeCode: emp.empId,
                name: `${emp.firstName} ${emp.lastName}`,
                businessUnit: emp.businessUnit ? emp.businessUnit.name : 'N/A',
                hireDate: emp.hireDate,
                designation: emp.designation,
                department: emp.department,
                resignationDate: resignation?.resignationDate || 'NA'
            }

            data.push(d);
        }

        const filePath = createEmployeeExit(data);

        console.log("Sending Mails ....")
        for(const mail of receivers){
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: mail,
                subject: 'Employee Exit Report',
                text: 'Please find attached the list of employees.',
                attachments: [
                    {
                        filename: 'employee_exit.xlsx',
                        path: filePath,
                    },
                ],
              };
        
            await transporter.sendMail(mailOptions);
        }

        console.log("Sent")

        return res.status(200).json({
            success:true,
            message:"Mail sent successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}