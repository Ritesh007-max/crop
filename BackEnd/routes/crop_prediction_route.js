const express = require("express");
const router = express.Router();
const aiModelService = require("../Services/aiModelService");

router.post("/crop-prediction", async (req, res) => {
  try {
    const { temperature, humidity, rainfall, soil_ph, ndvi, crop_type } = req.body;

    // Validate inputs
    if (temperature === undefined || humidity === undefined || rainfall === undefined) {
      return res.status(400).json({ error: "Missing required environmental parameters." });
    }

    const result = await aiModelService.predict({
      temperature,
      humidity,
      rainfall,
      soil_ph,
      ndvi,
      crop_type
    });

    if (result.error) {
      return res.status(500).json({ error: "AI prediction temporarily unavailable" });
    }

    res.json(result);
  } catch (error) {
    console.error("Prediction route error:", error);
    res.status(500).json({ error: "AI prediction temporarily unavailable" });
  }
});

module.exports = router;
