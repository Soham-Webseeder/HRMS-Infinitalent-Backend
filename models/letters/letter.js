const mongoose = require('mongoose');

const LetterSchema = new mongoose.Schema({
  pdfUrl: {
    type: String,
  },
  letterName: {
    type: String,
    required: true
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
    excludeEmployees: {
      type:[{ type: mongoose.Schema.Types.ObjectId, ref: 'employee' }],
      default: []
    },
    includedEmployees:{
      type:[{ type: mongoose.Schema.Types.ObjectId, ref: 'employee' }],
      default: []
    },
  },
  letterContent: {
    category: {
      type: String,
      required: true
    },
    template: {
      type: String, 
    },
    content: {
      type: String,
      required: true
    },
    saveAsTemplate: {
      type: Boolean,
      default: false
    }
  },
  emailDetails: {
    subject: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    }
  },
  signatories: {
    type: [String],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('Letter', LetterSchema);
