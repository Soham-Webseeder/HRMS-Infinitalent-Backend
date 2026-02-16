const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  alternativePhone: {
    type: String,
  },
  // SSN: {
  //   type: String,
  // },
  // city: {
  //   type: String,
  // },
  // zipcode: {
  //   type: String,
  // },
  presentAddress: {
    type: String,
  },
  permanentAddress: {
    type: String,
  },
  country: {
    type: String,
  },
  resume: {
    type: String,
  },
  document: {
    type: String,
  },
  jobPosition: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Designation"
  },
  jobPositionName:{
    type:String
  },
  applicationDate: {
    type: String,
  },
  interviewDate: {
    type: String,
  },
  linkedln: {
    type: String,
  },
  // Educational Information
  educationalInfo: [
    {
      obtainedDegree: {
        type: String,
      },
      university: {
        type: String,
      },
      CGPA: {
        type: String,
      },
      comments: {
        type: String,
      },
    },
  ],
  // Past Experience
  pastExperience: [
    {
      companyName: {
        type: String,
      },
      workingPeriod: {
        type: Number,
      },
      designation: {
        type: String,
      },
      // supervisior: {
      //   type: String,
      // },
    },
  ],
  status:{
    type:String
  },
  candidateId:{
    type:Number
  }
});

module.exports = mongoose.model("Candidate", candidateSchema);
