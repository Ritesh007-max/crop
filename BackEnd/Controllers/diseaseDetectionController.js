const fs = require("fs/promises");
const { detectPlantHealth } = require("../Services/geminiService");
const { detectVisionLabels } = require("../Services/visionService");

async function cleanupFile(filePath) {
  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (_error) {
    // Best-effort cleanup only.
  }
}

async function detectDisease(req, res) {
  if (!req.file) {
    return res.status(400).json({
      error: "No image uploaded. Provide a single image file in the 'image' field.",
    });
  }

  if (!req.file.mimetype?.startsWith("image/")) {
    await cleanupFile(req.file.path);
    return res.status(400).json({
      error: "Invalid image. Only image uploads are supported.",
    });
  }

  try {
    const [visionOutcome, plantOutcome] = await Promise.allSettled([
      detectVisionLabels(req.file.path),
      detectPlantHealth(req.file.path),
    ]);

    const visionResult =
      visionOutcome.status === "fulfilled"
        ? visionOutcome.value
        : { labels: [], rawLabels: [] };

    if (plantOutcome.status === "rejected") {
      return res.status(502).json({
        error: plantOutcome.reason?.message || "Google AI Studio inference failed.",
      });
    }

    const plantResult = plantOutcome.value;
    const topDisease = plantResult.diseases?.[0] || null;

    const responsePayload = {
      plant: plantResult.plant,
      health_status: plantResult.healthStatus,
      disease_name: topDisease?.name || "None",
      confidence: topDisease?.probability ?? plantResult.confidence ?? 0.95,
      vision_labels: visionResult.labels,
      treatment: topDisease?.treatment || "Consult an agronomist.",
      diseases: plantResult.diseases,
      vision_raw: visionResult.rawLabels,
    };

    return res.json(responsePayload);
  } finally {
    await cleanupFile(req.file.path);
  }
}

module.exports = {
  detectDisease,
};
