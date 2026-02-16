const express = require("express");
const {
  createCandidate,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  getAllCandidate,
  bulkImportCandidates,
} = require("../controllers/recruitment/candidate");
const {
  createShortlist,
  getAllShortlist,
  getShortlistById,
  updateShortlist,
  deleteShortlist,
} = require("../controllers/recruitment/shortlist");
const {
  createInterview,
  getAllInterview,
  getInterviewById,
  updateInterview,
  deleteInterview,
} = require("../controllers/recruitment/interview");
const {
  createSelection,
  getAllSelection,
  getSelectionById,
  updateSelection,
  deleteSelection,
} = require("../controllers/recruitment/selection");
const { createEmployeeRecruitment, getAllEmployeeRecruitments, getEmployeeRecruitmentById, updateEmployeeRecruitment, deleteEmployeeRecruitment } = require("../controllers/recruitment/employeeRecruitment");

const router = express.Router();

// Candidate Routes
router.post("/createCandidate", createCandidate);
router.get("/getAllCandidate", getAllCandidate);
router.get("/getCandidateById/:id", getCandidateById);
router.patch("/updateCandidate/:id", updateCandidate);
router.delete("/deleteCandidate/:id", deleteCandidate);
router.post("/bulk-import", bulkImportCandidates);


// Shortlist Candidate's Routes
router.post("/createShortlist", createShortlist);
router.get("/getAllShortlist", getAllShortlist);
router.get("/getShortlistById/:id", getShortlistById);
router.patch("/updateShortlist/:id", updateShortlist);
router.delete("/deleteShortlist/:id", deleteShortlist);

// Interview Routes
router.post("/createInterview", createInterview);
router.get("/getAllInterviews", getAllInterview);
router.get("/getInterviewById/:id", getInterviewById);
router.patch("/updateInterview/:id", updateInterview);
router.delete("/deleteInterview/:id", deleteInterview);

//  Selection Routes
router.post("/createSelection", createSelection);
router.get("/getAllSelection", getAllSelection);
router.get("/getSelectionById/:id", getSelectionById);
router.patch("/updateSelection/:id", updateSelection);
router.delete("/deleteSelection/:id", deleteSelection);


//  Employee Recruitment Routes
router.post("/createRecruitment", createEmployeeRecruitment);
router.get("/getAllRecruitments", getAllEmployeeRecruitments);
router.get("/getRecruitmentById/:id", getEmployeeRecruitmentById);
router.patch("/updateRecruitment/:id", updateEmployeeRecruitment);
router.delete("/deleteRecruitment/:id", deleteEmployeeRecruitment);

module.exports = router;
