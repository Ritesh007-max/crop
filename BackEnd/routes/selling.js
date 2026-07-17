const express = require("express");
const multer = require("multer");

const { analyzeSelling } = require("../Services/sellingEngine");

const router = express.Router();
const upload = multer();

router.post("/analyze", upload.any(), (req, res) => {
  let answers = {};

  try {
    answers = req.body.answers ? JSON.parse(req.body.answers) : {};
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: "Invalid selling questionnaire payload.",
    });
  }

  const analysis = analyzeSelling({
    answers,
    fileCount: Array.isArray(req.files) ? req.files.length : 0,
  });

  setTimeout(() => {
    res.json({
      success: true,
      ...analysis,
    });
  }, 1000);
});

module.exports = router;
