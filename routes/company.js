const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");

const {
  logo,
  updateCompany,
  getCompanyById,
  getAllData,
} = require("../controllers/company/company");
const {
  createDepartment,
  getDepartmentById,
  updateDepartmentById,
  deleteDepartmentById,
  getAllDepartments,
  deleteDepartment,
  getDepartments,
  getDepartmentsWithPagination,
} = require("../controllers/company/department");
const {
  createDesignation,
  getAllDesignations,
  getDesignationById,
  updateDesignationById,
  deleteDesignationById,
  getDesignations,
} = require("../controllers/company/designation");
const {
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncementById,
  getAnnouncementById,
  deleteAnnouncementById,
  getAnnouncements,
} = require("../controllers/company/announcement");
const {
  createGrade,
  getAllGrades,
  getGradeById,
  updateGradeById,
  deleteGradeById,
} = require("../controllers/company/grade");
const {
  createDivision,
  getAllDivisionsByDepartment,
  deleteDivision,
  getDivisionById,
  updateDivisionById,
  getAllDivisions,
} = require("../controllers/company/division");
const { createPolicy, getAllPolicies, getPolicyById, updatePolicy, deletePolicy } = require("../controllers/company/policy");
const { getLocationLogs,getGeofenceBreaches,updateEmployeeGeofence} = require("../controllers/company/admin");
const { getDashboardData, getByEmployeeIdOrName } = require("../controllers/dashboard");
const { createBusinessUnit, getAllBusinessUnits, getBusinessUnitById, updateBusinessUnitById, deleteBusinessUnitById, getBusinessUnits } = require("../controllers/company/bussinessUnit");
const upload = require("../middleware/uploadMiddleware");

// Company Routes
router.post("/logo", logo);
router.patch("/updateCompany", updateCompany);
router.get("/company/:id", getCompanyById);
router.get("/get-data/:id",getAllData)
// Department Routes
router.post("/createDepartment/:id", createDepartment);
router.get("/getAllDepartment", getAllDepartments);
router.get("/getDepartmentById/:id", getDepartmentById);
router.get("/getDepartments", getDepartments);
router.patch("/updateDepartment/:id", updateDepartmentById);
router.delete("/deleteDepartment/:id", deleteDepartment);

// Designation Routes
router.post("/createDesignation/:id", createDesignation);// Company Id
router.get("/getAllDesignations", getAllDesignations);// Company Id
router.get("/get-designations", getDesignations);// Company Id

router.get("/getDesignationById/:id", getDesignationById);
router.patch("/updateDesignation/:id", updateDesignationById);
router.delete("/deleteDesignation/:id", deleteDesignationById);

// Announcement Routes
router.post("/createAnnouncement/:id", createAnnouncement);// Company Id
router.get("/getAllAnnouncement/:id", getAllAnnouncements);// Company Id
router.get("/get-announcements",getAnnouncements)
router.get("/getAnnouncementById/:id", getAnnouncementById);
router.patch("/updateAnnouncement/:id", updateAnnouncementById);
router.delete("/deleteAnnouncement/:id", deleteAnnouncementById);

// Grade Routes
router.post("/createGrade/:id", createGrade);// Company Id
router.get("/getAllGrade/:id", getAllGrades);// Company Id
router.get("/getGradeById/:id", getGradeById);
router.patch("/updateGrade/:id", updateGradeById);
router.delete("/deleteGrade/:id", deleteGradeById);

// Division Routes
router.post("/createDivision/:id", createDivision);
router.get("/getAllDivision/:id", getAllDivisionsByDepartment); // Department Id
router.get("/getDivisionById/:id", getDivisionById); // Division id
router.get("/getAllDivision", getAllDivisions);
router.patch("/updateDivision/:id", updateDivisionById);
router.delete("/deleteDivision/:id", deleteDivision);

// Policy Routes
router.post("/createPolicy", upload.single('document'), createPolicy)
router.get("/getAllPolicies", getAllPolicies)
router.get("/getPolicyById/:id", getPolicyById)
router.patch("/updatePolicy/:id",upload.single('document'), updatePolicy)
router.delete("/deletePolicy/:id", deletePolicy)


// Admin Routes
router.get("/getLocationLogs/:id", getLocationLogs);
router.get("/getGeofenceBreaches/:id", getGeofenceBreaches);
router.post("/createEmployeeGeofence/:id",updateEmployeeGeofence);

// Dashboard data
router.get("/get-dashboard-data",getDashboardData)


// Route to get dashboard data
router.get("/dashboard", getDashboardData);
router.get("/getByEmployeeIdOrName/:param", getByEmployeeIdOrName);


// Bussiness Unit Routes
router.post("/createBussinessUnit", createBusinessUnit)
router.get("/getAllBussinessUnits", getAllBusinessUnits)
router.get("/get-bussinessUnits", getBusinessUnits)

router.get("/getBussinessUnitById/:id", getBusinessUnitById)
router.patch("/updateBussinessUnit/:id", updateBusinessUnitById)
router.delete("/deleteBussinessUnit/:id", deleteBusinessUnitById)

module.exports = router;

