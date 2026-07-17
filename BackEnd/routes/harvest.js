const express = require("express");
const { analyzeHarvest } = require("../Services/harvestEngine");

const router = express.Router();

router.post("/analyze", (req, res) => {
  let answers = {};

  try {
    answers = req.body.answers;
    if (typeof answers === "string") {
      answers = JSON.parse(answers);
    }
    if (!answers) {
      answers = req.body;
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: "Invalid harvest questionnaire payload.",
    });
  }

  const analysis = analyzeHarvest({
    answers,
  });

  setTimeout(() => {
    res.json({
      success: true,
      ...analysis,
    });
  }, 1200);
});

module.exports = router;
