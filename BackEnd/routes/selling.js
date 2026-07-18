const express = require("express");
const { analyzeSelling } = require("../Services/sellingEngine");

const router = express.Router();

router.post("/analyze", async (req, res) => {
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
      error: "Invalid selling questionnaire payload.",
    });
  }

  try {
    const analysis = await analyzeSelling({
      answers
    });

    res.json({
      success: true,
      ...analysis,
    });
  } catch (err) {
    console.error("Selling analysis failed:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to run selling analysis.",
    });
  }
});

module.exports = router;
