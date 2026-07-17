const fs = require("fs/promises");

const { detectPlantHealth } = require("../Services/plantIdService");
const { detectVisionLabels } = require("../Services/visionService");

function buildNoDiseaseResponse(visionLabels = []) {
  return {
    plant: "Unknown",
    health_status: "Unavailable",
    disease_name: null,
    confidence: 0,
    vision_labels: visionLabels,
    treatment: "Image disease detection is currently unavailable.",
  };
}

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
    const plantResult =
      plantOutcome.status === "fulfilled"
        ? plantOutcome.value
        : {
            plant: "Unknown",
            healthStatus: "Unavailable",
            confidence: 0,
            isHealthy: null,
            diseases: [],
          };

    if (visionOutcome.status === "rejected" && plantOutcome.status === "rejected") {
      return res.json({
        ...buildNoDiseaseResponse(),
        warning:
          plantOutcome.reason?.message ||
          visionOutcome.reason?.message ||
          "Disease detection providers are unavailable.",
        diseases: [],
        vision_raw: [],
      });
    }

    const topDisease = plantResult.diseases?.[0] || null;
    const hasDisease =
      topDisease ||
      (typeof plantResult.isHealthy === "boolean" && plantResult.isHealthy === false);

    const responsePayload = hasDisease
      ? {
          plant: plantResult.plant || "Unknown",
          health_status: plantResult.healthStatus || "Unknown",
          disease_name: topDisease?.name || "Unknown disease",
          confidence:
            topDisease?.probability ??
            plantResult.confidence ??
            0,
          vision_labels: visionResult.labels,
          treatment:
            topDisease?.treatment ||
            "Consult an agronomist and isolate affected leaves for treatment.",
          diseases: plantResult.diseases,
          vision_raw: visionResult.rawLabels,
          warning:
            visionOutcome.status === "rejected" || plantOutcome.status === "rejected"
              ? "Partial detection result returned because one provider is not configured or unavailable."
              : undefined,
        }
      : {
          ...buildNoDiseaseResponse(visionResult.labels),
          plant: plantResult.plant || "Unknown",
          health_status: plantResult.healthStatus || "Healthy",
          confidence: plantResult.confidence ?? 0,
          diseases: [],
          vision_raw: visionResult.rawLabels,
          warning:
            visionOutcome.status === "rejected" || plantOutcome.status === "rejected"
              ? "Partial detection result returned because one provider is not configured or unavailable."
              : undefined,
        };

    return res.json(responsePayload);
  } finally {
    await cleanupFile(req.file.path);
  }
}

module.exports = {
  detectDisease,
};
