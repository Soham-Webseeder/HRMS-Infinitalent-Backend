// models/company/policy.js
const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
    title: { type: String, required: true },
    document: { type: String, required: true },
    // This field allows the frontend to distinguish which section the policy belongs to
    category: { 
        type: String, 
        required: true,
        enum: ["HR", "Attendance", "Leave", "Holiday", "Resignation", "LateCome", "Bonus"]
    }
}, { timestamps: true });

module.exports = mongoose.model("Policy", policySchema);