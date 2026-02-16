const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  templateName: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  letterContent: { // Renaming `content` to `letterContent` for clarity
    type: String,
    required: true
  },
  emailSubject: { // Adding email subject field
    type: String,
    required: true
  },
  emailContent: { // Adding email content field
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isEnabled: {  
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Template', TemplateSchema);
