const express = require("express");
const Scheme = require("../Modules/scheme");

const router = express.Router();

// GET /api/schemes — list all schemes with optional filters
router.get("/", async (req, res) => {
  try {
    const { state, category, crop, search } = req.query;
    const filter = {};

    // Category filter
    if (category && category !== "all") {
      filter.category = category.toLowerCase();
    }

    // State filter
    if (state && state !== "all") {
      filter.states = { $in: ["all", state] };
    }

    // Crop filter
    if (crop && crop !== "all") {
      filter.crops = { $in: ["all", crop.toLowerCase()] };
    }

    // Text search
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { ministry: { $regex: search.trim(), $options: "i" } },
        { eligibility: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const schemes = await Scheme.find(filter).sort({ lastUpdated: -1 });

    res.json({ success: true, count: schemes.length, schemes });
  } catch (error) {
    console.error("Error fetching schemes:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch schemes." });
  }
});

// GET /schemes/:id — single scheme detail
router.get("/:id", async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ success: false, error: "Scheme not found." });
    }
    res.json({ success: true, scheme });
  } catch (error) {
    console.error("Error fetching scheme:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch scheme." });
  }
});

module.exports = router;
