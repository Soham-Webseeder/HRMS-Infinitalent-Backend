exports.calculateSalaryComponents = (grossSalary, employeeType) => {
    const deductionPercentages = {
        basicSalary: 0.35,
        hra: 0.20,
        da: 0.15,
        specialAllowance: 0.15,
        otherAllowance: 0.15,
        pfEmployee: 0.12,
        pfEmployer: 0.12,
        esicEmployee: 0.0075,
        esicEmployer: 0.0325,
        ptThreshold: 25000,
        ptAmount: 200,
    };

    const basicSalary = grossSalary * deductionPercentages.basicSalary;
    const hra = grossSalary * deductionPercentages.hra;
    const da = grossSalary * deductionPercentages.da;
    const specialAllowance = grossSalary * deductionPercentages.specialAllowance;
    const otherAllowance = grossSalary * deductionPercentages.otherAllowance;

    let pfEmployee = 0;
    let pfEmployer = 0;
    let esicEmployee = 0;
    let esicEmployer = 0;

    // PF and ESI are only accounted for in ICPL and ICPLOS
    if (employeeType === "ICPL" || employeeType === "ICPLOS") {
        const statutoryBase = basicSalary + hra + da;
        
        pfEmployee = Math.min(statutoryBase * deductionPercentages.pfEmployee, 1800);
        pfEmployer = Math.min(statutoryBase * deductionPercentages.pfEmployer, 1800);
        
        esicEmployee = grossSalary < 21000 ? statutoryBase * deductionPercentages.esicEmployee : 0;
        esicEmployer = grossSalary < 21000 ? statutoryBase * deductionPercentages.esicEmployer : 0;
    }

    const pt = grossSalary > deductionPercentages.ptThreshold ? deductionPercentages.ptAmount : 0;

    const totalDeductions = pfEmployee + esicEmployee + pt;
    const netSalary = grossSalary - totalDeductions;
    const annualSalary = grossSalary * 12;

    return {
        basicSalary,
        hra,
        da,
        specialAllowance,
        otherAllowance,
        totalDeductions,
        netSalary,
        grossSalary,
        pfEmployee,
        pfEmployer,
        esicEmployee,
        esicEmployer,
        pt,
        annualSalary
    };
};