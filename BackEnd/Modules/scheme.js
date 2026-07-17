const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  ministry: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["subsidy", "insurance", "credit", "infrastructure"],
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  eligibility: {
    type: String,
    required: true,
  },
  benefits: {
    type: String,
    required: true,
  },
  states: {
    type: [String],
    default: ["all"],
  },
  crops: {
    type: [String],
    default: ["all"],
  },
  maxLandAcres: {
    type: Number,
    default: 9999,
  },
  applicationUrl: {
    type: String,
    default: "",
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Text index for search
schemeSchema.index({ name: "text", description: "text", eligibility: "text" });

module.exports = mongoose.model("Scheme", schemeSchema);
