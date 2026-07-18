const { fetchLiveMandiPrices, fetchLiveMandiPricesByLocation } = require("./govDataService");
const { generateSellingStrategy } = require("./groqService");

function normalizeBoolean(value) {
  return value === true || value === "yes" || value === "true";
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function getPriceProfile(cropType) {
  if (!cropType) {
    return { low: 1800, high: 2400, trend: "average" };
  }

  const BASE_PRICES = {
    paddy: { low: 1900, high: 2350, trend: "average" },
    rice: { low: 2100, high: 2550, trend: "average" },
    wheat: { low: 2200, high: 2650, trend: "above average" },
    maize: { low: 1850, high: 2250, trend: "below average" },
    cotton: { low: 6400, high: 7600, trend: "above average" },
    sugarcane: { low: 320, high: 380, trend: "average" },
    tomato: { low: 900, high: 1800, trend: "mixed" },
    chili: { low: 7800, high: 9800, trend: "above average" },
    onion: { low: 1200, high: 1900, trend: "below average" },
    potato: { low: 1300, high: 1750, trend: "average" },
  };

  return BASE_PRICES[String(cropType).trim().toLowerCase()] || { low: 1800, high: 2400, trend: "average" };
}

async function analyzeSelling({ answers = {} }) {
  const cropType = answers.cropType || "General crop";
  const quantity = toNumber(answers.quantityValue, 25);
  const quantityUnit = answers.quantityUnit || "quintals";
  const urgency = answers.sellingUrgency || "Ask the system for a recommendation";
  const storageAvailable = normalizeBoolean(answers.storageAvailable);
  const transportArranged = normalizeBoolean(answers.transportArranged);
  const buyerPreference = answers.buyerPreference || "Request suggestion";
  const qualitySignal = answers.qualitySignal || "average";
  const defectLevel = answers.defectLevel || "medium";
  const state = answers.state || "";
  const district = answers.district || "";
  const latitude = answers.latitude;
  const longitude = answers.longitude;

  let profile = getPriceProfile(cropType);
  let liveSource = "";

  try {
    const livePrices = await fetchLiveMandiPricesByLocation(latitude, longitude, state, district, cropType);
    if (livePrices) {
      profile = {
        low: livePrices.low,
        high: livePrices.high,
        trend: "average"
      };
      liveSource = livePrices.source;
    }
  } catch (err) {
    console.warn("Mandi API fetch failed, falling back to static price profile.", err.message);
  }

  return await generateSellingStrategy(answers, profile);
}

module.exports = {
  analyzeSelling,
};
