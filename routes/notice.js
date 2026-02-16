const express = require("express");
const {
  createNotice,
  getAllNotice,
  updateNotice,
  getNoticeById,
  deleteNotice,
} = require("../controllers/notice/notice");
const router = express.Router();

// Notice Routes
router.post("/createNotice", createNotice);
router.get("/getAllNotice", getAllNotice);
router.get("/getNoticeById/:id", getNoticeById);
router.patch("/updateNotice/:id", updateNotice);
router.delete("/deleteNotice/:id", deleteNotice);

module.exports = router;
