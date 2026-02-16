const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Employee = require("../models/employee/employee");
const Company = require("../models/company/company");
require("dotenv").config();

// --- AUTHENTICATION ---

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter all the required fields.",
      });
    }

    // Direct search in Employee collection
    const employee = await Employee.findOne({ email }).populate("salarySetup");
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "Account not found. Please contact HR to be onboarded.",
      });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (isMatch) {
      // Create JWT Token
      const token = jwt.sign(
        { id: employee._id, role: employee.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Fetch the single global Company object
      // This ensures we get the ID even if the employee isn't explicitly linked yet
      const company = await Company.findOne({});

      // Standardizing response object with Employee Context
      const userToSend = {
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        empId: employee.empId,
        // Provide the companyId for the frontend Redux/LocalStorage
        companyId: company ? company._id : null 
      };

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      return res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user: userToSend,
        message: "Login Successful",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while logging in",
    });
  }
};

// --- PASSWORD MANAGEMENT ---

exports.changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, old password, and new password",
      });
    }

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, employee.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Old password is incorrect" });
    }

    employee.password = await bcrypt.hash(newPassword, 10);
    await employee.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update password" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    employee.otp = otp;
    employee.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await employee.save();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      to: employee.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 1 hour.`,
    });

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "An error occurred", error: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const employee = await Employee.findOne({ email });
    if (!employee || employee.otp !== otp || employee.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error occurred", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  try {
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    employee.password = await bcrypt.hash(newPassword, 10);
    employee.otp = undefined; // Clear OTP fields
    employee.resetPasswordExpires = undefined;
    
    await employee.save();
    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error occurred", error: err.message });
  }
};

// --- SYSTEM UPDATES ---

exports.updateFCMToken = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ success: false, message: 'FCM token is required.' });
    }

    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      { fcmToken: fcmToken, isTrackingEnabled: true },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    res.status(200).json({ success: true, message: 'FCM token updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error while updating token.' });
  }
};