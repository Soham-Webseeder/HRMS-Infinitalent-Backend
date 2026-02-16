const Grade = require("../../models/company/grade");
const Company = require("../../models/company/company");

// Create Grade
exports.createGrade = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const gradeData = {
      company: companyId,
      ...req.body,
    };

    const grade = new Grade(gradeData);
    await grade.save();

    company.grade.push(grade._id);
    await company.save();

    res.status(201).json({
      success: true,
      response: grade,
      message: "Grade created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while creating grade",
    });
  }
};

// Get All Grades
exports.getAllGrades = async (req, res) => {
  try {
    const companyId = req.params.id;
    if (!companyId) {
      return res.status(404).json({
        success: false,
        message: "Company Not Found",
      });
    }
    const grades = await Grade.find().populate("company");
    res.status(200).json({
      success: true,
      response: grades,
      message: "Grades fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching grades",
    });
  }
};

// Get Grade By ID
exports.getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found",
      });
    }
    res.status(200).json({
      success: true,
      response: grade,
      message: "Grade fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while getting grade details",
    });
  }
};

// Update Grade
exports.updateGradeById = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found",
      });
    }
    res.status(200).json({
      success: true,
      response: grade,
      message: "Grade updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while updating grade",
    });
  }
};

// Delete Grade
exports.deleteGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found",
      });
    }
    await grade.deleteOne();
    res.status(200).json({
      success: true,
      message: "Grade deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while deleting grade",
    });
  }
};
