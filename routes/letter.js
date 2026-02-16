const express = require('express');
const router = express.Router();
const {
    createCategory,
    getCategories,
    getTemplatesByCategory,
    saveAsTemplate,
    sendMail,
    createPost,
    getAllLetters,
    getAllPost,
    updateDraft,
    getDraftById,
    getDrafts,
    saveDraft,
    getAllTemplates,
    updateTemplateStatus,
    getTemplateById,
    deleteDraftById,
    deleteTemplateById,
    getSentLetter,
    getSignatories,
    addOrUpdateSignatory,
    deleteSignatory,
    getLetterById,
    deleteLetter,
    updateTemplate
} = require("../controllers/letter");

// Letter routes
router.post("/createCategory", createCategory);
router.get("/getCategory", getCategories);
router.get("/templates/:category", getTemplatesByCategory);
router.post("/saveAsTemplate", saveAsTemplate);
router.put("/updateTemplate/:id",updateTemplate);
router.post("/sendMail", sendMail);
router.post("/createPost", createPost);
router.get("/getAllLetters", getAllLetters);
router.get("/getAllPost", getAllPost);
router.get("/getDrafts", getDrafts);
router.get("/getDraftById/:id", getDraftById);
router.put("/updateDraft/:id", updateDraft);
router.post("/saveDraft", saveDraft);
router.get("/getAllTemplates", getAllTemplates);
router.put("/updateTemplateStatus/:id", updateTemplateStatus);
router.get("/getTemplateById/:templateId", getTemplateById);
router.delete("/deleteDraft/:id", deleteDraftById);
router.delete("/deleteTemplate/:id", deleteTemplateById);
router.get("/getSentLetter/:id", getSentLetter);
router.delete("/deleteLetter/:id",deleteLetter);
// Signatory routes
router.get("/getSignatories", getSignatories);
router.post("/createSignatory", addOrUpdateSignatory);
router.delete("/deleteSignatory/:id", deleteSignatory);

router.get("/:empId", getLetterById);

module.exports = router;
