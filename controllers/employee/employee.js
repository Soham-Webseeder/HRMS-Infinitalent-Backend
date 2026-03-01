const Employee = require("../../models/employee/employee");
const { uploadImageToCloudinary } = require("../../utils/imageUploader");
const bcrypt = require("bcrypt");
const xlsx = require("xlsx");
const Company = require("../../models/company/company");
const SalarySetup = require("../../models/salary/salarySetup");
const {
  calculateSalaryComponents,
} = require("../../utils/salarySetupCalculator");
const mongoose = require("mongoose");
const EmployeeChangeRequest = require("../../models/employee/employeeChangeRequest");
const bussinessUnit = require("../../models/company/bussinessUnit");
const { uploadDocumentToCloudinary } = require("../../utils/uploadDocument");
const nodemailer = require('nodemailer');
const payroll = require("../../models/payroll");
const LocationLog = require("../../models/LocationLog");
const { getAreaNameFromCoordinates } = require("../../utils/reverseGeocode");
const path = require('path');
const fs = require('fs');
const os = require('os');
const { sendPushNotification } = require('../notification');
const REMINDER_THRESHOLD_MINUTES = 30;
const { DateTime } = require('luxon');

exports.checkUserEmail = async (req, res) => {
  try {
    // Matches the frontend query: ?userEmail=${email}
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "Email parameter is required",
      });
    }

    // Check against the unified Employee collection
    const employee = await Employee.findOne({ email: userEmail });

    return res.status(200).json({
      success: true,
      // Matches frontend check: response.data.data?.exist
      data: {
        exist: !!employee,
      },
    });
  } catch (error) {
    console.error("Error checking user email:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const data = req.body;
    const files = req.files || []; // upload.any() returns an array

    // 1. Validate required fields
    const requiredFields = ["firstName", "email", "password", "phone", "empId"];
    for (const field of requiredFields) {
      if (!data[field]) throw new Error(`${field} is required.`);
    }

    // 2. Uniqueness Checks
    const existing = await Employee.findOne({ $or: [{ email: data.email }, { empId: data.empId }] });
    if (existing) throw new Error("Email or Employee ID already exists.");

    // Helper: Find file path and normalize backslashes to forward slashes
    const getPath = (fieldName) => {
      const file = files.find(f => f.fieldname === fieldName);
      return file ? file.path.replace(/\\/g, '/') : null;
    };

    // 3. Handle Standard Media Fields
    const mediaFields = ["photograph", "resume", "aadharCard", "panCard", "SSC", "HSC"];
    mediaFields.forEach(field => {
      const path = getPath(field);
      if (path) data[field] = path;
    });

    // 4. Handle Dynamic "Add Document" entries
    let dynamicDocuments = [];
    if (data.documents) {
      const incomingDocs = typeof data.documents === 'string'
        ? JSON.parse(data.documents)
        : data.documents;

      if (Array.isArray(incomingDocs)) {
        incomingDocs.forEach((doc, i) => {
          const docPath = getPath(`documents[${i}][docDocument]`);
          if (docPath || doc.docDocument) {
            dynamicDocuments.push({
              docName: doc.docName || `Document ${i + 1}`,
              docDocument: docPath || doc.docDocument
            });
          }
        });
      }
    }
    data.documents = dynamicDocuments;

    // 5. Hash password
    const plainPassword = data.password;
    data.password = await bcrypt.hash(data.password, 10);

    // 6. Atomic Creation: Employee First
    const employee = await Employee.create(data);

    try {
      // 7. Create Salary Setup ONLY if Employee creation succeeded
      let salaryComponents = calculateSalaryComponents(employee.salary, employee.employeeType);
      const salarySetup = await SalarySetup.create({
        ...salaryComponents,
        employeeName: employee._id,
        salaryType: data.salaryType || "Salary"
      });

      // Link Setup back to Employee
      employee.salarySetup = salarySetup._id;
      await employee.save();
    } catch (salaryError) {
      console.error("Salary Setup failed, but employee was created:", salaryError.message);
    }

    // 7. Send Welcome Email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"HR System" <${process.env.EMAIL_FROM}>`,
      to: employee.email,
      subject: "Welcome to the Company!",
      text: `Hello ${employee.firstName},\n\nYour account has been created successfully.\n\nLogin Details:\nEmail: ${employee.email}\nPassword: ${plainPassword}\nEmployee ID: ${employee.empId}\n\nPlease log in and update your profile.`,
    });

    return res.status(201).json({
      success: true,
      message: "Employee created and onboarded successfully.",
      data: employee,
    });

  } catch (error) {
    console.error("Error creating employee:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while creating employee.",
    });
  }
};

exports.bulkImportEmployees = async (req, res) => {
  try {
    const { businessUnitName } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    // 1. Resolve Business Unit
    const buDoc = await bussinessUnit.findOneAndUpdate(
      { name: businessUnitName },
      { name: businessUnitName },
      { upsert: true, new: true }
    );

    // 2. Parse Excel
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = xlsx.utils.sheet_to_json(sheet);

    // 3. Process Employees
    const results = await Promise.all(excelData.map(async (row) => {
      try {
        const email = row["Mail ID"]?.trim();
        if (!email) return null;

        // Duplicate check to avoid crashing the loop
        const existing = await Employee.findOne({ email });
        if (existing) return null;

        // Parse Name and Code
        const fullName = (row["Names"] || "").trim();
        const [firstName, ...lastNameParts] = fullName.split(/\s+/);
        const [employeeType, empId] = (row["ICPLNAPS CODE"] || "").split("-");
        const stipend = Number(row["Stipend"]) || 0;

        const hashedPassword = await bcrypt.hash("Test@1234", 10);

        // STEP A: Create the Employee FIRST
        const employee = await Employee.create({
          email,
          password: hashedPassword,
          role: "employee",
          firstName: firstName || "Employee",
          lastName: lastNameParts.join(" "),
          empId,
          employeeType: employeeType || "ICPLNAPS",
          salary: stipend,
          businessUnit: buDoc._id,
          employmentStatus: "Active",
          active: true
        });

        // STEP B: Create the SalarySetup ONLY after Employee succeeds
        const salaryComponents = calculateSalaryComponents(stipend, employeeType || "ICPLNAPS");
        const salarySetup = await SalarySetup.create({
          ...salaryComponents,
          employeeName: employee._id, // Link to employee immediately
          salaryType: "Salary"
        });

        // STEP C: Update Employee with the Setup ID
        employee.salarySetup = salarySetup._id;
        await employee.save();

        return employee;
      } catch (err) {
        console.error(`Row failed for ${row["Mail ID"]}:`, err.message);
        return null;
      }
    }));

    const count = results.filter(r => r !== null).length;
    res.status(200).json({
      success: true,
      message: `${count} employees and salary setups imported successfully into ${businessUnitName}.`
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Employee with pagination
exports.getAllEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const { name } = req.query;

    let filter = {};
    if (name) {
      filter.$or = [
        { firstName: { $regex: name, $options: "i" } },
        { middleName: { $regex: name, $options: "i" } },
        { lastName: { $regex: name, $options: "i" } },
      ];
    }

    // UPDATED: No longer needs 'user' population. 
    // All info (email, role, phone) is already in the Employee document.
    const employees = await Employee.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("salarySetup")
      .populate("businessUnit") // Added this as it's often needed in lists
      .lean(); // Use lean for faster read-only queries

    const totalEmployees = await Employee.countDocuments(filter);
    const totalPages = Math.ceil(totalEmployees / limit);

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Employee Found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalEmployees: totalEmployees,
      },
      message: "Employees Fetched Successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Active Employees
exports.getEmployee = async (req, res) => {
  try {
    // UPDATED: Simplified query
    const data = await Employee.find({ employmentStatus: "Active" })
      .populate("salarySetup")
      .populate("businessUnit")
      .lean();

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Active Employees Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Active Employees Fetched Successfully.",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get All Employees FOR EXPORT
exports.getEmployeesForExport = async (req, res) => {
  try {
    const data = await Employee.find({})
      .populate("salarySetup")
      .populate("businessUnit")
      .lean(); // Lean is much better for large exports

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employees Not Found",
      });
    }

    // UPDATED: Transformed data slightly cleaner
    const transformedData = data.map((employee) => ({
      ...employee,
      businessUnit: employee.businessUnit ? employee.businessUnit.name : null,
      // You can now easily export 'role' or 'email' directly from the employee object
    }));

    return res.status(200).json({
      success: true,
      message: "Employees Fetched Successfully",
      data: transformedData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching employees",
      error: error.message,
    });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Employee Id is required for fetching Employee",
      });
    }

    // UPDATED: Removed .populate("user") as those fields are now internal.
    // Added population for businessUnit and companyDetails to provide a complete profile.
    const employee = await Employee.findById(id)
      .populate("salarySetup")
      .populate("businessUnit")
      .populate("companyDetails");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: employee,
      message: "Employee Fetched Successfully.",
    });
  } catch (error) {
    console.error("Error in getEmployeeById:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Employee ID is required for updating Employee",
      });
    }

    const empData = req.body;
    const files = req.files || {}; // Populated by your updated Multer middleware

    // 1. Fetch current employee
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee Not Found",
      });
    }

    const getFilePath = (fieldName) => {
      const file = files.find(f => f.fieldname === fieldName);
      return file ? file.path.replace(/\\/g, '/') : null;
    };

    const mediaFields = ["photograph", "resume", "aadharCard", "panCard", "SSC", "HSC"];
    mediaFields.forEach(field => {
      const path = getFilePath(field);
      if (path) empData[field] = path;
    });

    // 2. Handle Dynamic "Add Document" entries
    let dynamicDocuments = [];
    if (empData.documents) {
      // Parse if sent as string (common in multipart)
      const incomingDocs = typeof empData.documents === 'string'
        ? JSON.parse(empData.documents)
        : empData.documents;

      if (Array.isArray(incomingDocs)) {
        incomingDocs.forEach((doc, i) => {
          // Look for indexed file key: "documents[0][docDocument]"
          const docFilePath = getFilePath(`documents[${i}][docDocument]`);

          dynamicDocuments.push({
            docName: doc.docName || `Document ${i + 1}`,
            docDocument: docFilePath || doc.docDocument, // Use new file path or keep existing
            ...(doc._id && { _id: doc._id })
          });
        });
      }
    }
    empData.documents = dynamicDocuments;

    // 4. Handle Authentication (Password Update)
    if (empData.password) {
      empData.password = await bcrypt.hash(empData.password, 10);
    }

    // 5. Recalculate salary if criteria changed
    const isTypeChanged = empData.employeeType && empData.employeeType !== employee.employeeType;
    const isSalaryChanged = empData.salary && empData.salary !== employee.salary;

    if (isSalaryChanged || isTypeChanged) {
      const currentSalary = empData.salary || employee.salary;
      const currentType = empData.employeeType || employee.employeeType;

      const newSalarySetup = calculateSalaryComponents(currentSalary, currentType);
      newSalarySetup.employeeName = employee._id;
      newSalarySetup.salaryType = empData.salaryType || employee.salaryType;

      if (employee.salarySetup) {
        await SalarySetup.findByIdAndUpdate(employee.salarySetup, newSalarySetup, { new: true });
        delete empData.salarySetup;
      }
    }

    // 6. Final Database Update
    const updatedData = await Employee.findByIdAndUpdate(id, empData, { new: true })
      .populate("salarySetup")
      .populate("businessUnit")
      .populate("companyDetails");

    return res.status(200).json({
      success: true,
      data: updatedData,
      message: "Employee media and profile updated successfully via local storage.",
    });

  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Employee
exports.deleteEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ // Changed status to 400 for bad request
        success: false,
        message: "Id is required for deleting Employee",
      });
    }

    // 1. Find the employee by ID
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee Not Found",
      });
    }

    // 2. Delete related salarySetups
    // Since everything else is merged, we only need to clean up this secondary collection
    const deletedSalarySetups = await SalarySetup.deleteMany({ employeeName: id });

    // 3. Delete the employee record 
    // This now automatically removes their auth info, profile, and system settings
    const deleteData = await Employee.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      data: {
        employee: deleteData,
        deletedSalarySetupsCount: deletedSalarySetups.deletedCount,
      },
      message: "Employee and related salary setups deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateEmploymentStatus = async (req, res) => {
  const { id } = req.params;
  const { employmentStatus } = req.body;

  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { employmentStatus },
      { new: true, runValidators: true }
    )
      .populate("salarySetup")
      .populate("businessUnit");

    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // Return a standardized JSON response
    return res.status(200).json({
      success: true,
      message: `Employment status updated to ${employmentStatus}`,
      data: updatedEmployee
    });
  } catch (error) {
    console.error("Status Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating employment status",
      error: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, message: "Employee ID required" });
    }

    const data = req.body;
    const files = req.files || [];

    // 1. Helper to find file path and normalize slashes for local storage
    const getPath = (fieldName) => {
      const file = files.find(f => f.fieldname === fieldName);
      return file ? file.path.replace(/\\/g, '/') : null;
    };

    // 2. Map standard media fields to local uploads paths
    const mediaFields = ["photograph", "resume", "aadharCard", "panCard", "SSC", "HSC"];
    mediaFields.forEach(field => {
      const path = getPath(field);
      if (path) data[field] = path; // Overwrite data with the local file path
    });

    // 3. Handle Dynamic "Add Document" entries
    let dynamicDocuments = [];
    if (data.documents) {
      const incomingDocs = typeof data.documents === 'string'
        ? JSON.parse(data.documents)
        : data.documents;

      if (Array.isArray(incomingDocs)) {
        incomingDocs.forEach((doc, i) => {
          const docPath = getPath(`documents[${i}][docDocument]`);
          if (docPath || doc.docDocument) {
            dynamicDocuments.push({
              docName: doc.docName || `Document ${i + 1}`,
              docDocument: docPath || doc.docDocument // Keep existing if no new file uploaded
            });
          }
        });
      }
    }
    data.documents = dynamicDocuments;

    // 4. Verify Employee exists
    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ success: false, message: "Employee Not Found" });

    // 5. Create the Change Request with local paths in the 'changes' object
    const employeeChangeRequest = await EmployeeChangeRequest.create({
      employeeName: id,
      changes: {
        ...data,
        documents: data.documents,
      },
      status: "Pending"
    });

    return res.status(200).json({
      success: true,
      data: employeeChangeRequest,
      message: "Profile update request submitted with local file paths.",
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployeesByAudienceGroup = async (req, res) => {
  try {
    const { audienceGroup } = req.params;
    // Ensure audienceOptions is treated as an array even if one item is sent
    const audienceOptions = Array.isArray(req.query.audienceOptions)
      ? req.query.audienceOptions
      : [req.query.audienceOptions].filter(Boolean);

    let employees = [];

    // 1. Handle "All" or "Specific" targeting
    if (audienceGroup === "All Employees" || audienceGroup === "Specific Employees") {
      employees = await Employee.find({ employmentStatus: "Active" }).select("_id firstName lastName");
    }

    // 2. Handle Business Unit targeting
    else if (audienceGroup === "Business Unit" && audienceOptions.length > 0) {
      // Find IDs for the named business units
      const units = await BusinessUnit.find({ name: { $in: audienceOptions } }).select("_id");
      const unitIds = units.map(u => u._id);

      // Find employees directly linked to these units in the merged schema
      employees = await Employee.find({
        businessUnit: { $in: unitIds },
        employmentStatus: "Active"
      }).select("_id firstName lastName");
    }

    // 3. Handle Department targeting
    else if (audienceGroup === "Departments" && audienceOptions.length > 0) {
      employees = await Employee.find({
        department: { $in: audienceOptions },
        employmentStatus: "Active"
      }).select("_id firstName lastName");
    }

    // 4. Validate results
    if (!employees || employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active employees found for the selected group."
      });
    }

    // 5. Standardized response
    return res.status(200).json({
      success: true,
      data: {
        employee: employees.map((emp) => ({
          _id: emp._id,
          employeeName: `${emp.firstName} ${emp.lastName || ""}`.trim(),
        })),
      },
      message: `${audienceGroup} employees fetched successfully.`,
    });
  } catch (error) {
    console.error("Error in getEmployeesByAudienceGroup:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.query;

    const employee = await Employee.findOne({ email });

    let exist = false;
    if (employee) {
      exist = true;
    }

    return res.status(200).json({
      success: true,
      data: { exist },
      message: "",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateUserRoleByEmployeeId = async (req, res) => {
  const { id } = req.params; // employee ID from request parameters
  const { newRole } = req.body; // new role from request body (e.g., "admin", "hr", "employee")

  try {
    // 1. Validate that the role is one of the allowed enum values
    const validRoles = ["admin", "hr", "employee"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role provided. Role must be admin, hr, or employee.",
      });
    }

    // 2. Find and update the employee directly
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { role: newRole },
      { new: true, runValidators: true }
    ).select("_id firstName lastName email role");

    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // 3. Return the updated data
    return res.status(200).json({
      success: true,
      message: `Employee role updated to ${newRole} successfully.`,
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Role Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update employee role. Please try again.",
      error: error.message,
    });
  }
};

exports.getAllEmployeesWithRole = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const { name } = req.query;

    // 1. Build the filter object
    let filter = {};
    if (name) {
      filter.$or = [
        { firstName: { $regex: name, $options: "i" } },
        { middleName: { $regex: name, $options: "i" } },
        { lastName: { $regex: name, $options: "i" } },
      ];
    }

    // 2. Fetch directly from Employee
    const employees = await Employee.find(filter)
      .populate("salarySetup")
      .skip(skip)
      .limit(limit)
      .lean();

    // 3. Count the total number of employees matching the filter
    const totalEmployees = await Employee.countDocuments(filter);
    const totalPages = Math.ceil(totalEmployees / limit);

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Employee Found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: employees, // This now naturally contains the 'role' field
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalEmployees: totalEmployees,
      },
      message: "Employees Fetched Successfully.",
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.empIdExists = async (req, res) => {
  try {
    const { empId, employeeName } = req.query; // employeeName is likely the _id from the frontend

    if (!empId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID (empId) is required for this check.",
      });
    }

    // Search for the ID in the unified Employee collection
    const employee = await Employee.findOne({ empId }).select("_id").lean();

    // Logic: 
    // 1. If no employee found, ID is available (exists: false)
    // 2. If employee found but matches the current record's _id, it's also available (exists: false)
    if (!employee || employee._id.toString() === employeeName) {
      return res.status(200).json({
        success: true,
        exists: false,
      });
    }

    // 3. Otherwise, the ID is taken by someone else
    return res.status(200).json({
      success: true,
      exists: true,
    });
  } catch (error) { // Fixed: Added 'error' parameter to catch
    console.error("empId Check Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while checking Employee ID.",
    });
  }
};

exports.getTerminatedOrResignedEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const { name } = req.query;

    // 1. Build the filter object
    // We filter by status directly in the merged Employee collection
    let filter = { employmentStatus: { $in: ["Terminated", "Resigned"] } };

    if (name) {
      filter.$or = [
        { firstName: { $regex: name, $options: "i" } },
        { middleName: { $regex: name, $options: "i" } },
        { lastName: { $regex: name, $options: "i" } },
      ];
    }

    // 2. Fetch employees directly
    // No need to look for a 'user' document anymore; role and email are here.
    const employees = await Employee.find(filter)
      .populate("salarySetup")
      .skip(skip)
      .limit(limit)
      .lean(); // Faster performance for read-only listing

    // 3. Count matching documents for pagination
    const totalEmployees = await Employee.countDocuments(filter);
    const totalPages = Math.ceil(totalEmployees / limit);

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Terminated or Resigned Employees Found.",
      });
    }

    // 4. Return unified data
    return res.status(200).json({
      success: true,
      data: employees, // Contains profile + role + status
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalEmployees: totalEmployees,
      },
      message: "Ex-Employees Fetched Successfully.",
    });
  } catch (error) {
    console.error("Fetch Ex-Employees Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllEmployeesByPayroll = async (req, res) => {
  try {
    const { salaryType, date } = req.query;

    // 1. Validate the date parameter
    if (!date || !date.includes('-')) {
      return res.status(400).json({
        success: false,
        message: "A valid date in YYYY-MM format is required."
      });
    }

    const year = date.split('-')[0];
    const month = date.split('-')[1];

    // 2. Fetch payrolls and populate the unified Employee record
    const payrolls = await payroll.find({ salaryType, month, year })
      .populate({
        path: "employeeName",
        select: "firstName lastName email empId department businessUnit phone photograph"
      })
      .lean(); // Using lean for faster read performance

    // 3. Filter out any records where the employee might have been deleted
    const employees = payrolls
      ?.filter(pay => pay.employeeName)
      .map(pay => pay.employeeName);

    // 4. Return the standardized response
    return res.status(200).json({
      success: true,
      data: employees,
      message: "Successfully fetched the employees for the specified payroll period."
    });
  } catch (error) {
    console.error("Payroll Fetch Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error occurred while fetching payroll employees.",
      error: error.message,
    });
  }
};

function isWithinGeofence(point, center, radius) {
  const toRad = deg => deg * Math.PI / 180;
  const [lng1, lat1] = point;
  const [lng2, lat2] = center;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d <= radius;
}

function isWithinDistance(coord1, coord2, thresholdMeters = 15) {
  const toRad = deg => deg * Math.PI / 180;
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c <= thresholdMeters;
}

exports.logLocation = async (req, res) => {
  try {
    const { coordinates, accuracy, source, forceLog } = req.body;
    const employeeId = req.params.id;

    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const lastLog = await LocationLog.findOne({ employee: employeeId }).sort({ timestamp: -1 });

    const COORD_SAME_THRESHOLD_MINUTES = 5;
    const STATIONARY_THRESHOLD_MINUTES = 5;
    const COORD_SAME_DISTANCE_METERS = 15;

    let motionStatus = 'moving';

    if (lastLog) {
      const isSameLocation = isWithinDistance(lastLog.coordinates, coordinates, COORD_SAME_DISTANCE_METERS);
      const timeDiff = (Date.now() - new Date(lastLog.timestamp).getTime()) / (60 * 1000); // in minutes

      console.log('TimeDiff:', timeDiff, 'mins');
      console.log('isSameLocation:', isSameLocation);

      if (isSameLocation) {
        if (timeDiff < COORD_SAME_THRESHOLD_MINUTES) {
          return res.status(200).json({
            success: true,
            message: 'Coordinate unchanged recently, skipping log'
          });
        }

        if (timeDiff >= STATIONARY_THRESHOLD_MINUTES) {
          motionStatus = 'stationary';
        }
      }
    }

    let geofenceStatus = 'inside';
    if (employee.geofenceCenter && employee.geofenceRadius) {
      const isInside = isWithinGeofence(coordinates, employee.geofenceCenter, employee.geofenceRadius);
      if (!isInside) geofenceStatus = 'outside';
    }

    const areaName = await getAreaNameFromCoordinates(coordinates);

    const locationLog = await LocationLog.create({
      employee: employeeId,
      coordinates,
      accuracy,
      source,
      geofenceStatus,
      motionStatus,
      areaName
    });

    console.log('Logged:', motionStatus);

    res.status(200).json({
      success: true,
      message: geofenceStatus === 'outside' ? "Geofence breach detected" : "Location logged",
      locationLog
    });
  } catch (err) {
    console.error("Error logging location:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.checkLocationLogsAndSendReminder = async () => {
  console.log(`\n--- Running location reminder check at ${new Date().toISOString()} ---`);

  try {
    const now = DateTime.now().setZone("Asia/Kolkata");
    if (!now.isValid) {
      console.error("Failed to set timezone using luxon.");
      return;
    }

    const currentHour = now.hour;
    const START_HOUR = 9;
    const END_HOUR = 18;

    if (currentHour < START_HOUR || currentHour >= END_HOUR) {
      console.log(`Skipping reminder check: Current hour ${currentHour} is outside the allowed slot (9 AM to 6 PM IST).`);
      return;
    }

    const thresholdTime = new Date(Date.now() - REMINDER_THRESHOLD_MINUTES * 60 * 1000);

    // 1. Fetch only Employees who are trackable and have an active FCM token
    const trackableEmployees = await Employee.find({
      fcmToken: { $exists: true, $ne: null },
      isTrackingEnabled: true,
      employmentStatus: "Active" // Only remind active staff
    }).select('_id fcmToken firstName');

    for (const emp of trackableEmployees) {
      // 2. Query LocationLog using the Employee's MongoDB _id
      const lastLog = await LocationLog.findOne({
        employee: emp._id,
        timestamp: { $gte: thresholdTime }
      }).sort({ timestamp: -1 });

      // 3. If NO recent log entry is found, send a reminder
      if (!lastLog) {
        const title = "🕒 Location Log Reminder";
        const message = `Hi ${emp.firstName}, please submit your current location. It's been over ${REMINDER_THRESHOLD_MINUTES} minutes!`;

        // Pass the Employee _id (which is the userId) to the notification service
        await sendPushNotification(
          emp._id,
          title,
          message,
          'LOCATION_REMINDER',
          {
            trigger: 'CRON_REMINDER',
            employeeId: emp._id.toString()
          }
        );
      }
    }
    console.log("--- Location reminder check complete. ---");

  } catch (error) {
    console.error("CRON Error checking location logs:", error);
  }
};