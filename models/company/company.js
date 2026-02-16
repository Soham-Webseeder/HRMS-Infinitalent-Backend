const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    brandName: {
      type: String,
    },
    companyEmail: {
      type: String,
    },
    companyContact: {
      type: Number,
    },
    website: {
      type: String,
    },
    domainName: {
      type: String,
    },
    industryType: {
      type: String,
    },
    linkedinUrl: {
      type: String,
    },
    facebookUrl: {
      type: String,
    },
    twitterUrl: {
      type: String,
    },
    youtubeUrl: {
      type: String,
    },
    companyName: {
      type: String,
    },
    companySize: {
      type: String,
    },
    yourRole: {
      type: String,
    },
    companyIndustry: {
      type: String,
    },
    requirements: [
      {
        type: String,
      },
    ],
    registeredOffice: {
      addressLine1: {
        type: String,
      },
      addressLine2: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      country: {
        type: String,
      },
      pincode: {
        type: String,
      },
    },
    corporateOffice: {
      addressLine1: {
        type: String,
      },
      addressLine2: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      country: {
        type: String,
      },
      pincode: {
        type: String,
      },
    },
    customOffice: {
      addressLine1: {
        type: String,
      },
      addressLine2: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      country: {
        type: String,
      },
      pincode: {
        type: String,
      },
    },
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
    ],
    designations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Designation",
      },
    ],
    grade: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Grade",
      },
    ],
    announcements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Announcement",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
