const xlsx = require('xlsx');

exports.createEmployeeMaster = (data) => {
    const transformedData = data.map(employee => ({
        'Employee Code': employee.empId,
        Name: `${employee.firstName} ${employee.lastName}`,
        Email: employee.email,
        'Mobile Number': employee.phone,
        'Secondary Mobile Number': employee.alternativePhone,
        'Business Unit': employee.businessUnit ? employee.businessUnit.name : 'N/A',
        'Gender': employee.gender,
        'Date Of Joining': employee.hireDate,
        'Date Of Birth': employee.dateOfBirth,
        'Marital Status': employee.maritalStatus,
        // 'Employee Type': employee.employeeType,
        // 'Office Location Name': employee.presentCity, // Adjust as necessary for office location
        'Designation': employee.designation,
        'Department': employee.department,
        'Bank Name': employee.bankName,
        'Branch Name': employee.branchName,
        'Account Holder Name': employee.acHolderName,
        'Account Number': employee.accountNo,
        'Account Type': employee.accountType,
        'IFSC Code': employee.ifscCode,
        // 'Swift Code': employee.swiftCode || 'N/A', // Assuming you have a swiftCode field
        'PAN Number': employee.panCard,
        'Aadhaar Enrollment Number': employee.aadharCard,
        // 'Present Address': employee.presentAddress,
        // 'Present State': employee.presentState,
        // 'Present City': employee.presentCity,
        // 'Present Pincode': employee.presentPincode,
        // 'Present Country': employee.presentCountry,
        // 'Permanent Address': employee.permanentAddress,
        // 'Permanent State': employee.permanentState,
        // 'Permanent City': employee.permanentCity,
        // 'Permanent Pincode': employee.permanentPincode,
        // 'Permanent Country': employee.permanentCountry,
        'Employee Status': employee.employmentStatus,
      }));
    const ws = xlsx.utils.json_to_sheet(transformedData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Employees');
    const filePath = 'employee_master.xlsx';
    xlsx.writeFile(wb, filePath);
    return filePath;
}

exports.createEmployeeExit = (data) => {
  const transformedData = data.map(d => ({
    'Employee Code': d.employeeCode,
    Name: d.name,
    'Business Unit': d.businessUnit,
    'Date Of Joining': d.hireDate,
    'Designation': d.designation,
    'Department': d.department,
    'Resignation Date':d.resignationDate
  }));
  const ws = xlsx.utils.json_to_sheet(transformedData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Employees');
  const filePath = 'employee_exit.xlsx';
  xlsx.writeFile(wb, filePath);
  return filePath;
}
