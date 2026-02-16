const mongoose = require("mongoose");

const locationLogSchema = new mongoose.Schema({
  // Reference to the unified Employee model
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Employee", 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  coordinates: { 
    type: [Number], // [longitude, latitude]
    required: true 
  },
  accuracy: { 
    type: Number 
  },
  source: { 
    type: String, 
    enum: ['AUTO', 'MANUAL'], 
    default: 'AUTO' 
  },
  geofenceStatus: { 
    type: String, 
    enum: ['inside', 'outside'], 
    required: true 
  },
  motionStatus: { 
    type: String, 
    enum: ['moving', 'stationary'], 
    required: true 
  },
  areaName: { 
    type: String 
  }
}, { 
  timestamps: true 
});

locationLogSchema.index({ employee: 1, timestamp: -1 });

locationLogSchema.index({ coordinates: "2dsphere" });

module.exports = mongoose.model("LocationLog", locationLogSchema);