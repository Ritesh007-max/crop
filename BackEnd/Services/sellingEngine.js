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

const STORAGE_OPTIONS = [
  { name: "Primary Rural Warehouse", capacity: "120 quintals", cost: "INR 12/quintal/day", distance: "6 km" },
  { name: "Agri Co-op Cold Room", capacity: "80 crates", cost: "INR 18/crate/day", distance: "14 km" },
  { name: "Local PACS Storage", capacity: "60 bags", cost: "INR 9/bag/day", distance: "4 km" },
];

const TRANSPORT_OPTIONS = [
  { route: "Village to nearest mandi", vehicle: "Mini truck", cost: "INR 1,800-2,600", eta: "Same day" },
  { route: "Village to district market", vehicle: "Medium truck", cost: "INR 3,500-5,000", eta: "4-6 hrs" },
  { route: "Village to buyer collection point", vehicle: "Pickup van", cost: "INR 1,200-1,900", eta: "2-3 hrs" },
];

const BUYER_OPTIONS = {
  mandi: [
    { name: "District Mandi Trader", channel: "Mandi", priceRange: "Market linked", note: "Suitable for bulk lots with quick sale." },
    { name: "Commission Agent", channel: "Mandi", priceRange: "Slightly variable", note: "Useful when daily arrival volumes are high." },
  ],
  contractor: [
    { name: "Regional Contractor", channel: "Contractor", priceRange: "Quality dependent", note: "Better when consistent lot quality is available." },
    { name: "Processor-linked Buyer", channel: "Contractor", priceRange: "Contract-based", note: "Prefers sorted and packed produce." },
  ],
  local: [
    { name: "Town Wholesale Buyer", channel: "Local buyer", priceRange: "Fast-moving lots", note: "Best for small to medium volumes." },
    { name: "Retail Aggregator", channel: "Local buyer", priceRange: "Fresh produce premium", note: "Works when transport is already arranged." },
  ],
  platform: [
    { name: "Platform-assisted lead pool", channel: "Platform-assisted selling", priceRange: "Competitive bids", note: "Useful when the farmer can wait for better matches." },
    { name: "Digital produce board", channel: "Platform-assisted selling", priceRange: "Buyer comparison", note: "Best when quality images and quantity are clear." },
  ],
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

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

  return BASE_PRICES[String(cropType).trim().toLowerCase()] || { low: 1800, high: 2400, trend: "average" };
}

function getDefects(defectLevel, storageAvailable, transportArranged) {
  const defects = [];

  if (defectLevel === "high") defects.push("visible spoilage or defect risk");
  if (defectLevel === "medium") defects.push("mixed quality consistency");
  if (!storageAvailable) defects.push("limited holding conditions");
  if (!transportArranged) defects.push("dispatch delay risk");

  return defects;
}

function getQualityRating(score) {
  if (score >= 78) return "Strong";
  if (score >= 55) return "Mixed";
  return "At Risk";
}

function getSaleReadiness(score) {
  if (score >= 78) return "Ready";
  if (score >= 55) return "Needs Sorting";
  return "Hold";
}

function getSellDecision({ urgency, saleReadiness, storageAvailable, priceTrend }) {
  if (urgency === "Sell immediately") return "Sell immediately";
  if (saleReadiness === "Hold" && storageAvailable) return "Store temporarily";
  if (priceTrend === "below average" && storageAvailable) return "Wait for better prices";
  if (saleReadiness === "Needs Sorting") return "Sort first, then sell";
  return "Sell now";
}

function inferBuyerChannel(preference, qualityRating, transportArranged) {
  if (preference && preference !== "Request suggestion") return preference;
  if (qualityRating === "Strong" && transportArranged) return "Platform-assisted selling";
  if (qualityRating === "At Risk") return "Local buyer";
  return "Mandi (local market)";
}

function getBuyerKey(channel) {
  const normalized = String(channel || "").toLowerCase();
  if (normalized.includes("contract")) return "contractor";
  if (normalized.includes("platform")) return "platform";
  if (normalized.includes("local")) return "local";
  return "mandi";
}

function analyzeSelling({ answers = {}, fileCount = 0 }) {
  const cropType = answers.cropType || "General crop";
  const quantity = toNumber(answers.quantityValue, 25);
  const quantityUnit = answers.quantityUnit || "quintals";
  const urgency = answers.sellingUrgency || "Ask the system for a recommendation";
  const storageAvailable = normalizeBoolean(answers.storageAvailable);
  const transportArranged = normalizeBoolean(answers.transportArranged);
  const buyerPreference = answers.buyerPreference || "Request suggestion";
  const qualitySignal = answers.qualitySignal || "average";
  const defectLevel = answers.defectLevel || "medium";

  const profile = getPriceProfile(cropType);
  const qualityScore = clamp(
    62 +
      (qualitySignal === "strong" ? 18 : qualitySignal === "weak" ? -15 : 0) +
      (defectLevel === "low" ? 10 : defectLevel === "high" ? -18 : 0) +
      (fileCount >= 3 ? 4 : 0) +
      (storageAvailable ? 4 : -6),
    28,
    92
  );

  const saleReadyScore = clamp(
    qualityScore +
      (transportArranged ? 4 : -5) +
      (urgency === "Sell immediately" ? 4 : urgency === "Wait 3–5 days" ? -2 : 0),
    25,
    95
  );

  const qualityRating = getQualityRating(qualityScore);
  const saleReadiness = getSaleReadiness(saleReadyScore);
  const priceLow = Math.round(profile.low * (qualityScore / 70));
  const priceHigh = Math.round(profile.high * (qualityScore / 72));
  const averagePrice = Math.round((priceLow + priceHigh) / 2);
  const priceContext = profile.trend === "mixed" ? "average" : profile.trend;

  const logisticsCost = quantity * (transportArranged ? 28 : 36);
  const handlingCost = quantity * (qualityRating === "Strong" ? 18 : qualityRating === "Mixed" ? 24 : 31);
  const storageCost = storageAvailable ? quantity * 14 : quantity * 6;
  const totalCost = Math.round(logisticsCost + handlingCost + storageCost);

  const buyerChannel = inferBuyerChannel(buyerPreference, qualityRating, transportArranged);
  const sellDecision = getSellDecision({
    urgency,
    saleReadiness,
    storageAvailable,
    priceTrend: priceContext,
  });

  const cautiousRevenue = priceLow * quantity;
  const averageRevenue = averagePrice * quantity;
  const bestRevenue = priceHigh * quantity;

  return {
    summary: {
      cropType,
      quantity,
      quantityUnit,
      saleReadiness,
    },
    cards: {
      saleReadiness: {
        rating: saleReadiness,
        score: saleReadyScore,
        note:
          saleReadiness === "Ready"
            ? "The lot appears saleable with the current conditions."
            : saleReadiness === "Needs Sorting"
              ? "Sorting or grading should improve the selling outcome."
              : "Hold or stabilize the lot before taking it to market.",
      },
      qualitySnapshot: {
        rating: qualityRating,
        strengths: qualityRating === "Strong" ? ["uniform appearance", "saleable presentation", "better lot consistency"] : ["usable marketable volume"],
        defects: getDefects(defectLevel, storageAvailable, transportArranged),
      },
      estimatedPriceRange: {
        low: priceLow,
        high: priceHigh,
        unit: `per ${quantityUnit === "kilograms" ? "kg" : quantityUnit === "bags" ? "bag" : quantityUnit === "crates" ? "crate" : "quintal"}`,
        expectedRevenue: averageRevenue,
      },
      historicalPriceContext: {
        trend: priceContext,
        note:
          priceContext === "above average"
            ? "Current conditions are better than a typical season."
            : priceContext === "below average"
              ? "Prices look softer than a usual season."
              : "Prices are close to normal seasonal levels.",
      },
      costAndMarginView: {
        bestCaseMargin: bestRevenue - totalCost,
        averageCaseMargin: averageRevenue - totalCost,
        cautiousCaseMargin: cautiousRevenue - totalCost,
        totalSellingCost: totalCost,
      },
      sellNowVsStore: {
        recommendation: sellDecision,
        rationale:
          sellDecision === "Wait for better prices"
            ? "Storage flexibility and softer price context support waiting briefly."
            : sellDecision === "Store temporarily"
              ? "Quality is not ideal yet, but holding is possible."
              : "Selling now reduces handling risk and shortens cash cycle.",
      },
      storagePartnerOptions: {
        options: STORAGE_OPTIONS.slice(0, storageAvailable ? 2 : 3),
      },
      transportOptions: {
        options: TRANSPORT_OPTIONS.map((option) => ({
          ...option,
          note: transportArranged ? "Transport already arranged; use for price comparison." : "Transport should be locked before dispatch.",
        })),
      },
      buyerVisibility: {
        preferredChannel: buyerChannel,
        buyers: BUYER_OPTIONS[getBuyerKey(buyerChannel)],
      },
    },
  };
}

module.exports = {
  analyzeSelling,
};
