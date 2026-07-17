const mongoose = require("mongoose");

const districtCoordinateSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true
  },

  district: {
    type: String,
    required: true
  },

  lat: {
    type: Number,
    required: true
  },

  lon: {
    type: Number,
    required: true
  }

});

districtCoordinateSchema.index({ state: 1, district: 1 }, { unique: true });

module.exports = mongoose.model("DistrictCoordinate", districtCoordinateSchema);
