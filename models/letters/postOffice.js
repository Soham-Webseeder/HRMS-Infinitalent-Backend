const mongoose = require('mongoose');

const postOfficeSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
    },
    letterName: {
        type: String,
        required: true,
    },
    letterContent: {
        category: {
            type: String,
            required: true,
        },
        template: {
            type: String,
            required: true,
        },
    },
    audience: {
        group: {
            type: String,
            required: true
        },
        options: {
            type: [String],
            required: true
        },
        includedEmployees: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'employee' }],
            default: []
        },
        excludeEmployees: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'employee' }],
            default: []
        },
    },
    signatories: {
        type: [String], // Array of signatories
        default: [],
    },
    type: {
        type: String,
        enum: ['Available for download', 'Available on request', 'Auto triggered', 'None'],
        default: 'None'
    },
    status: {
        type: String,
        default: 'published', // Default to 'draft'
    },
});

// Export the model
module.exports = mongoose.model('PostOffice', postOfficeSchema);
