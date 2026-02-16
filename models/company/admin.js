const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const AdminSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    contact: {
        type: String
    },
    image: {
        type: String
    },
    designation: {
        type: String,
        required: true
    }
});

// Create a model based on the schema
const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
