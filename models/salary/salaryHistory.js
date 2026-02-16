const mongoose = require('mongoose');
const moment = require('moment');

const salaryHistorySchema = new mongoose.Schema({
  employeeName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // Adjust the reference based on your Employee model
    required: true
  },
  totalSalary: {
    type: Number,
    required: true
  },
  leaveDays: {
    type: Number,
    default: 0
  },
  workingDays: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  paidBy: {
    type: String,
    enum: ['Bank Transfer', 'Cash', 'Cheque'], // Adjust based on your payment methods
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      ret.createdAt = moment(ret.createdAt).format('DD MMM YYYY');
      ret.updatedAt = moment(ret.updatedAt).format('DD MMM YYYY');
      return ret;
    }
  }
});

module.exports = mongoose.model('SalaryHistory', salaryHistorySchema);