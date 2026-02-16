const express = require("express");
const router = express.Router();

const {
  login,
  changePassword,
  forgotPassword,
  verifyOTP,
  resetPassword,
  updateFCMToken
} = require("../controllers/auth");

//Auth Routes
router.post("/login", login);
router.post("/changepassword", changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP)
router.post("/reset-password", resetPassword)
router.put('/:id/fcm-token', updateFCMToken);

module.exports = router;