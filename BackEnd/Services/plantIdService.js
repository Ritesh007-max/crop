const fs = require("fs/promises");
const path = require("path");

const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const PLANT_ID_URL = "https://api.plant.id/v2/health_assessment";

function toBase64(buffer) {
  return buffer.toString("base64");
}

function normalizePlantIdResponse(data) {
  const suggestions = data?.suggestions || [];
  const topSuggestion = suggestions[0] || {};

  const diseases =
    data?.health_assessment?.diseases ||
    topSuggestion?.health_assessment?.diseases ||
    [];

  const topDisease = diseases[0] || {};
  const diseaseDetails = topDisease?.disease_details || {};
  const probability =
    topDisease?.probability ??
    topSuggestion?.probability ??
    data?.health_assessment?.is_healthy?.probability ??
    0;

  const healthyProbability =
    data?.health_assessment?.is_healthy?.probability ??
    topSuggestion?.health_assessment?.is_healthy?.probability ??
    null;

  const isHealthy =
    typeof data?.health_assessment?.is_healthy?.binary === "boolean"
      ? data.health_assessment.is_healthy.binary
      : typeof topSuggestion?.health_assessment?.is_healthy?.binary === "boolean"
        ? topSuggestion.health_assessment.is_healthy.binary
        : healthyProbability !== null
          ? healthyProbability >= 0.5
          : diseases.length === 0;

  return {
    plant:
      topSuggestion?.plant_name ||
      topSuggestion?.plant_details?.common_names?.[0] ||
      topSuggestion?.plant_details?.scientific_name ||
      "Unknown",
    healthStatus: isHealthy ? "Healthy" : "Diseased",
    confidence: Number(probability) || 0,
    isHealthy,
    diseases: diseases.map((disease) => ({
      name:
        disease?.name ||
        disease?.disease_details?.common_names?.[0] ||
        "Unknown disease",
      probability: Number(disease?.probability) || 0,
      treatment:
        disease?.disease_details?.treatment?.biological?.join(", ") ||
        disease?.disease_details?.treatment?.chemical?.join(", ") ||
        disease?.disease_details?.treatment?.prevention?.join(", ") ||
        "Consult local crop protection guidance for treatment.",
    })),
    raw: data,
  };
}

async function detectPlantHealth(imagePath) {
  if (!process.env.PLANT_ID_API_KEY) {
    const error = new Error("PLANT_ID_API_KEY is not configured.");
    error.statusCode = 500;
    throw error;
  }

  const imageBuffer = await fs.readFile(imagePath);
  const payload = {
    images: [toBase64(imageBuffer)],
    modifiers: ["crops_fast", "similar_images"],
    disease_details: [
      "cause",
      "common_names",
      "classification",
      "description",
      "treatment",
      "url",
    ],
    health: "all",
  };

  try {
    const response = await axios.post(PLANT_ID_URL, payload, {
      headers: {
        "Api-Key": process.env.PLANT_ID_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 20000,
    });

    return normalizePlantIdResponse(response.data);
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Plant.id API request failed.";
    const serviceError = new Error(message);
    serviceError.statusCode = 502;
    throw serviceError;
  }
}

module.exports = {
  detectPlantHealth,
};
