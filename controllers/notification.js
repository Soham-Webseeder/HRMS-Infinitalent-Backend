// controllers/notificationController.js

const admin = require('../config/firebaseAdmin');
const Notification = require('../models/notification');
const Employee = require("../models/employee/employee");

/**
 * Internal function to save the notification record to the database.
 */
exports.createNotification = async ({ employeeId, message, type, title }) => {
    try {
        if (!employeeId || !message || !type) {
             throw new Error("userId, message, and type are required.");
        }
        
        // Check for existing unread notification and increment count (based on your original logic)
        const existingNotification = await Notification.findOne({
            employeeId,
            message,
            type,
            read: false,
        });

        if (existingNotification) {
            existingNotification.count += 1;
            await existingNotification.save();
        } else {
            const notification = new Notification({ employeeId, message, type, title });
            await notification.save();
        }
    } catch (error) {
        console.error("Error creating notification record:", error);
    }
};

/**
 * Internal service function to send a push notification via FCM and log it.
 * This is called by the location reminder cron job.
 */
exports.sendPushNotification = async (employeeId, title, message, type, data = {}) => {
    try {
        const employee = await Employee.findById(employeeId);

        if (!employee || !employee.fcmToken) {
            console.log(`Skipping push: Employee ${employeeId} not found or no FCM token.`);
            return;
        }

        // 1. Save the notification to the database
        await exports.createNotification({
            employeeId: employee._id, 
            message: message,
            type: type,
            title: title,
        });

        // 2. Prepare and Send FCM Payload
        const payload = {
            notification: { title: title, body: message },
            data: {
                ...data,
                notificationType: type,
                employeeId: employeeId.toString(),
            },
            token: employee.fcmToken,
        };

        await admin.messaging().send(payload);
        console.log(`FCM sent successfully for Employee ${employeeId}. Type: ${type}`);
        
    } catch (error) {
        console.error("Error sending push notification:", error);
    }
};