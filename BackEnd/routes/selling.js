const express = require("express");
const multer = require("multer");

const { analyzeSelling } = require("../Services/sellingEngine");

const router = express.Router();
const upload = multer();

router.post("/analyze", upload.any(), async (req, res) => {
  let answers = {};

  try {
    answers = req.body.answers ? JSON.parse(req.body.answers) : {};
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: "Invalid selling questionnaire payload.",
    });
  }

  try {
    const analysis = await analyzeSelling({
      answers,
      fileCount: Array.isArray(req.files) ? req.files.length : 0,
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
