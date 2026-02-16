const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 
const express = require("express");
const app = express();
const path = require("path");

const authRouter = require("./routes/auth");
const companyRouter = require("./routes/company");
const employeeRouter = require("./routes/employee");
const assetsRouter = require("./routes/asset");
const noticeRouter = require("./routes/notice");
const leaveRouter = require("./routes/leave");
const salaryRouter = require("./routes/salary");
const recruitmentRouter = require("./routes/recruitment");
const attendanceRouter = require("./routes/attendance");
const dashboardRouter = require("./routes/dashboard");
const payrollRouter = require("./routes/payroll");
const letterRouter = require("./routes/letter");
const reportRouter = require("./routes/report");
const notificationRouter = require("./routes/notification");
const event = require("./routes/event");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const { cloudinaryConnect } = require("./config/cloudinary");
// const fileUpload = require("express-fileupload");
const PORT = process.env.PORT || 4000;
const bodyParser = require('body-parser')
const cron = require('node-cron');
const { checkLocationLogsAndSendReminder } = require('./controllers/employee/employee');

database.connect();

cron.schedule('*/5 * * * *', () => {
    console.log('CRON: Triggering location log reminder check...');
    
    // 🚨 Execute the core reminder logic
    checkLocationLogsAndSendReminder(); 
    
}, {
    // Optional: Name your cron job for easier management/logging (available in some libraries)
    name: 'location-reminder', 
    // Recommended: Set timezone if your server needs to adhere to a specific location's time.
    // Omit this if your logic relies on UTC or the server's local time.
    timezone: "Asia/Kolkata" 
});

dotenv.config();


app.use(express.json({ limit: '20mb' })); // Set to a higher limit if necessary
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.use(express.json());

app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// app.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "/tmp/",
//   })
// );

cloudinaryConnect();

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/company", companyRouter);
app.use("/api/v1/employee", employeeRouter);
app.use("/api/v1/asset", assetsRouter);
app.use("/api/v1/notice", noticeRouter);
app.use("/api/v1/leave", leaveRouter);
app.use("/api/v1/salary", salaryRouter);
app.use("/api/v1/recruitment", recruitmentRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/event", event);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/payroll", payrollRouter);
app.use("/api/v1/letter", letterRouter);
app.use("/api/v1/report",reportRouter);
app.use("/api/v1/notifications",notificationRouter);

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running...",
  });
});

app.listen(PORT, () => {
  console.log(`App is listening at ${PORT}`);
});

module.exports = app;
