const notificationController = require('../controllers/notification')
const express = require("express");
const router = express.Router();

router.post('/send-test-push/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        // This simulates the CRON job finding a user and sending a push
        await notificationController.sendPushNotification(
            userId,
            "Location Reminder",
            "This confirms the FCM pipe is working correctly.",
            'Location Foreground Reminder',
            { source: 'manual-api-test' }
        );
        res.status(200).json({ success: true, message: "Manual push initiated. Check console and device." });
    } catch (error) {
        console.error("Manual test failed:", error);
        res.status(500).json({ success: false, message: "Manual test failed to execute." });
    }
});

module.exports = router;