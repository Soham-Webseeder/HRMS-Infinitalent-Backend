const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee', 
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: { 
        type: String,
        required: true,
    },
    title: { 
        type: String,
    },
    read: {
        type: Boolean,
        default: false,
    },
    count: {
        type: Number,
        default: 1,
    },
}, { timestamps: true }); 


notificationSchema.index({ employeeId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);