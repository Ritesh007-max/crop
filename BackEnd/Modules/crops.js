const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },

  crop_name: {
    type: String,
    required: true
  },

  ideal_temp_min: {
    type: Number,
    required: true
  },

  ideal_temp_max: {
    type: Number,
    required: true
  },

  rainfall_min: {
    type: Number,
    required: true
  },

  rainfall_max: {
    type: Number,
    required: true
  },

  water_requirement: {
    type: String,
    enum: ["low", "medium", "high"],
    required: true
  },

  labour_need: {
    type: String,
    enum: ["low", "medium", "high"],
    required: true
  },

  avg_cost_per_acre: {
    type: Number,
    required: true
  },

  avg_yield_per_acre: {
    type: Number,
    required: true
  },

  avg_market_price: {
    type: Number,
    required: true
  },

  crops_to_avoid_after: [
    {
      type: String
    }
  ],

  season: {
    type: String,
    enum: ["Kharif", "Rabi", "Zaid", "Perennial"],
    required: true
  },

  growing_days: {
    type: Number,
    required: true
  }

});

module.exports = mongoose.model("Crop", cropSchema);
