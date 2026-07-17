const express = require("express");
const multer = require("multer");

const router = express.Router();
const upload = multer();

const mockActionCards = {
  fertilizerGuidance: {
    recommended: ["Urea", "DAP (Diammonium Phosphate)"],
    dosage: "50kg per acre",
    timing: "Apply early morning or late evening",
    avoid: ["Nitrogen heavy fertilizers during fruiting"],
    description: "Your crop is entering the vegetative stage. Balanced NPK will support stronger growth.",
  },
  pestPrevention: {
    risks: ["Aphids", "Whitefly"],
    prevention: ["Use neem oil spray every 15 days", "Install yellow sticky traps"],
    warningSigns: ["Curling leaves", "Sticky honeydew on leaves"],
    treatments: ["Imidacloprid if infestation is severe"],
    description: "Humid conditions increase the risk of sucking pests and secondary infections.",
  },
  weatherForecast: {
    expected: "Partly cloudy with isolated thunderstorms",
    temperature: "28C - 34C",
    humidity: "70%",
    rainfall: "10-15mm expected over next 3 days",
    impact: "High humidity may increase fungal infection risks. Delay chemical sprays until rain passes.",
    description: "Good growing conditions overall, but monitor moisture-sensitive disease pressure.",
  },
  soilSustainability: {
    rating: "Good",
    details: "Soil organic carbon is sufficient. pH is near optimal at 6.5.",
    actionRequired: "Consider crop rotation next season and add organic matter after harvest.",
    description: "The current soil profile can sustain the crop with light corrective management.",
  },
  waterPlanning: {
    status: "Sufficient",
    waterNeeded: "20mm per week",
    available: "Rainfall expected, reduce irrigation by 50%",
    recommendation: "Switch to drip irrigation where possible to cut water loss.",
    description: "Water availability is adequate for the coming days.",
  },
  actionPlan: {
    week: "Week 4",
    tasks: [
      { day: "Day 1", task: "Apply neem oil preventative spray." },
      { day: "Day 3", task: "Inspect lower leaves for initial pest signs." },
      { day: "Day 5", task: "Top dress with urea." },
      { day: "Day 7", task: "Light irrigation if rainfall does not arrive." },
    ],
    description: "A simple weekly plan to maintain crop health and reduce avoidable stress.",
  },
};

router.post("/analyze", upload.any(), (req, res) => {
  setTimeout(() => {
    res.json({ success: true, cards: mockActionCards });
  }, 1200);
});

module.exports = router;
