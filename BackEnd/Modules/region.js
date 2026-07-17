const mongoose = require("mongoose");

const regionSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true
  },

  district: {
    type: String,
    required: true
  }

});

regionSchema.index({ state: 1, district: 1 }, { unique: true });

module.exports = mongoose.model("Region", regionSchema);
