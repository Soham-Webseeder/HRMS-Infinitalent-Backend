const bussinessUnit = require("../models/company/bussinessUnit");
const salarySetup = require("../models/salary/salarySetup");
const employee = require("../models/employee/employee");

exports.letterAndEmailContentHandlers = async (content, emp, company) => {
  
  // Function to fetch Business Unit Name by ID
  const getBusinessUnitName = async (businessUnitId) => {
    try {
      const businessUnit = await bussinessUnit.findById (businessUnitId);
      return businessUnit ? businessUnit.name : ''; // Return name if found, else empty string
    } catch (error) {
      console.error("Error fetching Business Unit Name:", error);
      return ''; // Return empty string in case of error
    }
  };

  const getFormattedSalarySetup = async (employeeId) => {
    try {
      // Find the salary document linked to this employee's _id
      const salary = await salarySetup.findOne({ employeeName: employeeId }); 
      
      if (!salary) {
          return "Salary details are not available for this employee.";
      }

      // --- 1. Format Currency Values ---
      // Use toFixed(2) to ensure two decimal places for currency display
      const gross = salary.grossSalary ? salary.grossSalary.toFixed(2) : 'N/A';
      const basic = salary.basicSalary ? salary.basicSalary.toFixed(2) : 'N/A';
      const hra = salary.hra ? salary.hra.toFixed(2) : 'N/A';
      const da = salary.da ? salary.da.toFixed(2) : 'N/A';
      const specAllow = salary.specialAllowance ? salary.specialAllowance.toFixed(2) : 'N/A';
      const otherAllow = salary.otherAllowance ? salary.otherAllowance.toFixed(2) : 'N/A';
      const pfEmp = salary.pfEmployee ? salary.pfEmployee.toFixed(2) : 'N/A';
      const esicEmp = salary.esicEmployee ? salary.esicEmployee.toFixed(2) : 'N/A';
      const totalDeductions = salary.totalDeductions ? salary.totalDeductions.toFixed(2) : 'N/A';
      const net = salary.netSalary ? salary.netSalary.toFixed(2) : 'N/A';
      const annual = salary.annualSalary ? salary.annualSalary.toFixed(2) : 'N/A';

      // --- 2. Build the HTML Table/Content Block ---
      const salaryTableHTML = `
        <table style="width: 100%; border-collapse: collapse; font-size: 11pt;">
            <tr>
                <td colspan="2" style="font-weight: bold; padding: 5px 0; border-bottom: 1px solid #ccc;">Annual CTC:</td>
                <td colspan="2" style="font-weight: bold; padding: 5px 0; border-bottom: 1px solid #ccc;">${annual}</td>
            </tr>
            <tr>
                <td colspan="4" style="font-weight: bold; padding-top: 10px;">Monthly Components</td>
            </tr>
            <tr>
                <td style="padding: 3px 10px;">Basic Salary:</td>
                <td style="padding: 3px 10px; text-align: right;">${basic}</td>
                <td style="padding: 3px 10px;">HRA:</td>
                <td style="padding: 3px 10px; text-align: right;">${hra}</td>
            </tr>
            <tr>
                <td style="padding: 3px 10px;">Dearness Allowance (DA):</td>
                <td style="padding: 3px 10px; text-align: right;">${da}</td>
                <td style="padding: 3px 10px;">Special Allowance:</td>
                <td style="padding: 3px 10px; text-align: right;">${specAllow}</td>
            </tr>
            <tr>
                <td style="padding: 3px 10px;">Other Allowance:</td>
                <td style="padding: 3px 10px; text-align: right;">${otherAllow}</td>
                <td style="padding: 3px 10px;">Gross Salary:</td>
                <td style="padding: 3px 10px; text-align: right; font-weight: bold;">${gross}</td>
            </tr>
            <tr>
                <td colspan="4" style="font-weight: bold; padding-top: 10px;">Deductions</td>
            </tr>
            <tr>
                <td style="padding: 3px 10px;">PF (Employee Share):</td>
                <td style="padding: 3px 10px; text-align: right;">${pfEmp}</td>
                <td style="padding: 3px 10px;">ESIC (Employee Share):</td>
                <td style="padding: 3px 10px; text-align: right;">${esicEmp}</td>
            </tr>
            <tr>
                <td colspan="2" style="padding: 3px 10px; font-weight: bold; border-top: 1px solid #ccc;">Total Deductions:</td>
                <td colspan="2" style="padding: 3px 10px; text-align: right; font-weight: bold; border-top: 1px solid #ccc;">${totalDeductions}</td>
            </tr>
            <tr>
                <td colspan="2" style="padding: 10px 10px; font-weight: bold; border-top: 2px solid #000;">Net Monthly Salary (Take Home):</td>
                <td colspan="2" style="padding: 10px 10px; text-align: right; font-weight: bold; border-top: 2px solid #000;">${net}</td>
            </tr>
        </table>
      `;

      return salaryTableHTML;

    } catch (error) {
      console.error("Error fetching Salary Setup:", error);
      return "Error loading salary data.";
    }
  };

  // Fetch the Business Unit name
  const businessUnitName = await getBusinessUnitName(emp.businessUnit);
  const formattedSalaryHTML = await getFormattedSalarySetup(emp._id);
  
  return content
    .replace(/{letter_generation_date}/g, new Date().toLocaleDateString('en-GB'))
    .replace(/{first_name}/g, emp.firstName || '')
    .replace(/{last_name}/g, emp.lastName || '')
    .replace(/{emailid}/g, emp.email || '')
    .replace(/{primary_phone_number}/g, emp.phone || '')
    .replace(/{businessunit}/g, businessUnitName) // Replace ID with Name
    .replace(/{department}/g, emp.department || '')
    .replace(/{team}/g, emp.team || '')
    .replace(/{designation}/g, emp.designation || '')
    .replace(/{reporting_office}/g, emp.reportingOffice || '')
    .replace(/{date_of_joining}/g, emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('en-GB') : '')
    .replace(/{date_of_probation}/g, emp.probationCompletionDate || '')
    .replace(/{total_experience}/g, emp.totalExperience || '')
    .replace(/{primary_manager}/g, emp.primaryManager || '')
    .replace(/{employment_type}/g, emp.employmentType || '')
    .replace(/{employee_profile_image}/g, emp.profileImage || '')
    .replace(/{company_logo}/g, company.logo || '')
    .replace(/{company_registered_name}/g, businessUnitName || '')
    .replace(/{full_name}/g, `${emp.firstName || ''} ${emp.lastName || ''}`)
    .replace(/{date_of_birth}/g, emp.dateOfBirth || '')
    .replace(/{aadhar_number}/g, emp.aadharNumber || '')
    .replace(/{pan_number}/g, emp.panNumber || '')
    .replace(/{employee_id}/g, `${emp.employeeType || ''} ${emp.empId || ''}`)
    .replace(/{salary_setup_details}/g, formattedSalaryHTML);
};
