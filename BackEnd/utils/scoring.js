/**
 * Seed2Success — Crop Scoring Engine
 * 
 * Scoring Weights:
 *   Weather suitability → 30%
 *   Budget compatibility → 20%
 *   Labour availability → 15%
 *   Water requirement match → 15%
 *   Crop rotation compatibility → 10%
 *   Market profitability → 10%
 */

const SCORE_WEIGHTS = {
  weather: 30,
  budget: 20,
  labour: 15,
  water: 15,
  cropRotation: 10,
  profitability: 10,
};

const LEVEL_MAP = { low: 1, medium: 2, high: 3 };

function normalizeLevel(value) {
  return String(value || "medium").trim().toLowerCase();
}

/**
 * WEATHER SUITABILITY (30%)
 * Score how well the current weather matches the crop's ideal conditions.
 */
function scoreWeather(weather, crop) {
  if (!weather || weather.temperature == null) {
    return 0.5; // Neutral if no data
  }

  let tempScore = 0;
  let rainScore = 0;
  let humidityScore = 0;

  // Temperature scoring
  const temp = weather.temperature;
  const tempMin = crop.ideal_temp_min;
  const tempMax = crop.ideal_temp_max;
  const tempMid = (tempMin + tempMax) / 2;
  const tempRange = (tempMax - tempMin) / 2;

  if (temp >= tempMin && temp <= tempMax) {
    // Within ideal range — score based on how close to the midpoint
    const distFromMid = Math.abs(temp - tempMid);
    tempScore = 1 - (distFromMid / tempRange) * 0.3; // 0.7 to 1.0
  } else {
    // Outside range — penalize based on distance
    const distOutside = temp < tempMin ? tempMin - temp : temp - tempMax;
    tempScore = Math.max(0, 1 - distOutside / 15);
  }

  // Precipitation scoring (monthly approximation: daily * 30)
  const monthlyRain = weather.precipitation * 30;
  const rainMin = crop.rainfall_min;
  const rainMax = crop.rainfall_max;
  const rainMid = (rainMin + rainMax) / 2;

  if (monthlyRain >= rainMin && monthlyRain <= rainMax) {
    const distFromMid = Math.abs(monthlyRain - rainMid);
    const rainRange = (rainMax - rainMin) / 2 || 1;
    rainScore = 1 - (distFromMid / rainRange) * 0.25;
  } else if (monthlyRain < rainMin) {
    rainScore = Math.max(0, 1 - (rainMin - monthlyRain) / rainMin);
  } else {
    rainScore = Math.max(0, 1 - (monthlyRain - rainMax) / rainMax);
  }

  // Humidity scoring
  const humidity = weather.humidity || 50;
  // Map water requirement to ideal humidity
  const waterLevel = normalizeLevel(crop.water_requirement);
  const idealHumidity =
    waterLevel === "high" ? 75 : waterLevel === "medium" ? 55 : 35;
  const humDiff = Math.abs(humidity - idealHumidity);
  humidityScore = Math.max(0, 1 - humDiff / 50);

  // Weighted combination: temp 50%, rain 30%, humidity 20%
  return tempScore * 0.5 + rainScore * 0.3 + humidityScore * 0.2;
}

/**
 * BUDGET COMPATIBILITY (20%)
 * Checks if the farmer's budget can cover the crop's cost per acre.
 */
function scoreBudget(budgetPerAcre, crop) {
  const costPerAcre = crop.avg_cost_per_acre;

  if (budgetPerAcre >= costPerAcre) {
    // Can fully afford — better surplus = higher score
    const surplus = budgetPerAcre / costPerAcre;
    return Math.min(1, 0.7 + surplus * 0.1);
  }

  // Can't fully afford — penalize proportionally
  const ratio = budgetPerAcre / costPerAcre;
  return Math.max(0.05, ratio * 0.7);
}

/**
 * LABOUR AVAILABILITY (15%)
 * Match farmer's labour level against the crop's labour need.
 */
function scoreLabour(farmerLabour, crop) {
  const farmerLevel = LEVEL_MAP[normalizeLevel(farmerLabour)] || 2;
  const cropLevel = LEVEL_MAP[normalizeLevel(crop.labour_need)] || 2;

  const diff = farmerLevel - cropLevel;

  if (diff >= 0) {
    return 1; // Farmer has enough or more labour
  }

  if (diff === -1) {
    return 0.5; // Slightly short on labour
  }

  return 0.15; // Severely short on labour
}

/**
 * WATER REQUIREMENT MATCH (15%)
 * Match water availability (weather-based precipitation) against the crop's need.
 */
function scoreWaterRequirement(weather, crop) {
  const waterLevel = normalizeLevel(crop.water_requirement);

  // Derive water availability from precipitation + humidity
  const precipitation = weather?.precipitation || 0;
  const humidity = weather?.humidity || 50;

  let availabilityLevel;
  if (precipitation > 5 || humidity > 70) {
    availabilityLevel = "high";
  } else if (precipitation > 1 || humidity > 45) {
    availabilityLevel = "medium";
  } else {
    availabilityLevel = "low";
  }

  const available = LEVEL_MAP[availabilityLevel] || 2;
  const needed = LEVEL_MAP[waterLevel] || 2;

  if (available >= needed) {
    return 1;
  }

  if (available === needed - 1) {
    return 0.5;
  }

  return 0.15;
}

/**
 * CROP ROTATION COMPATIBILITY (10%)
 * Check if the farmer's previous crop is compatible.
 */
function scoreCropRotation(previousCrop, crop) {
  if (!previousCrop || previousCrop.trim() === "") {
    return 0.6; // Neutral — no info
  }

  const prev = previousCrop.trim().toLowerCase();
  const avoidList = (crop.crops_to_avoid_after || []).map((c) =>
    c.toLowerCase()
  );

  // If the current crop name matches previous crop → avoid monoculture
  if (crop.crop_name.toLowerCase() === prev) {
    return 0.1;
  }

  // If previous crop is in the avoid list
  if (avoidList.includes(prev)) {
    return 0.15;
  }

  return 1; // Good rotation
}

/**
 * MARKET PROFITABILITY (10%)
 * Calculate expected revenue relative to cost.
 */
function scoreProfitability(crop) {
  const revenue = crop.avg_yield_per_acre * crop.avg_market_price;
  const cost = crop.avg_cost_per_acre;
  const profitRatio = revenue / cost;

  if (profitRatio >= 5) return 1;
  if (profitRatio >= 3) return 0.85;
  if (profitRatio >= 2) return 0.7;
  if (profitRatio >= 1.5) return 0.55;
  if (profitRatio >= 1) return 0.35;
  return 0.1;
}

/**
 * Calculate risk level based on various factors.
 */
function calculateRiskLevel(weather, crop, overallScore) {
  let riskFactors = 0;

  // Weather mismatch risk
  const weatherScore = scoreWeather(weather, crop);
  if (weatherScore < 0.4) riskFactors += 2;
  else if (weatherScore < 0.6) riskFactors += 1;

  // High investment risk
  if (crop.avg_cost_per_acre > 20000) riskFactors += 1;

  // Low overall score risk
  if (overallScore < 50) riskFactors += 1;

  if (riskFactors >= 3) return "High";
  if (riskFactors >= 1) return "Medium";
  return "Low";
}

/**
 * Main scoring function.
 * Returns a score out of 100 for a given crop.
 */
function calculateCropScore(input, crop, weather) {
  const landArea = Number(input.landArea) || 1;
  const totalBudget = Number(input.budget) || 50000;
  const budgetPerAcre = totalBudget / landArea;

  const weatherScore = scoreWeather(weather, crop);
  const budgetScore = scoreBudget(budgetPerAcre, crop);
  const labourScore = scoreLabour(input.labour, crop);
  const waterScore = scoreWaterRequirement(weather, crop);
  const rotationScore = scoreCropRotation(input.previousCrop, crop);
  const profitScore = scoreProfitability(crop);

  const weightedTotal =
    SCORE_WEIGHTS.weather * weatherScore +
    SCORE_WEIGHTS.budget * budgetScore +
    SCORE_WEIGHTS.labour * labourScore +
    SCORE_WEIGHTS.water * waterScore +
    SCORE_WEIGHTS.cropRotation * rotationScore +
    SCORE_WEIGHTS.profitability * profitScore;

  const suitabilityScore = Math.round(weightedTotal);
  const riskLevel = calculateRiskLevel(weather, crop, suitabilityScore);

  return {
    crop: crop.crop_name,
    suitability_score: suitabilityScore,
    estimated_cost: `₹${(crop.avg_cost_per_acre * landArea).toLocaleString("en-IN")} per acre`,
    expected_yield: `${crop.avg_yield_per_acre * landArea} tons`,
    risk_level: riskLevel,
    details: {
      weather_score: Math.round(weatherScore * 100),
      budget_score: Math.round(budgetScore * 100),
      labour_score: Math.round(labourScore * 100),
      water_score: Math.round(waterScore * 100),
      rotation_score: Math.round(rotationScore * 100),
      profitability_score: Math.round(profitScore * 100),
    },
    crop_info: {
      season: crop.season,
      growing_days: crop.growing_days,
      ideal_temp: `${crop.ideal_temp_min}°C - ${crop.ideal_temp_max}°C`,
      rainfall_range: `${crop.rainfall_min}mm - ${crop.rainfall_max}mm`,
      water_requirement: crop.water_requirement,
      labour_need: crop.labour_need,
      cost_per_acre: crop.avg_cost_per_acre,
      yield_per_acre: crop.avg_yield_per_acre,
      market_price: crop.avg_market_price,
    },
  };
}

module.exports = {
  calculateCropScore,
  scoreWeather,
  scoreBudget,
  scoreLabour,
  scoreWaterRequirement,
  scoreCropRotation,
  scoreProfitability,
  calculateRiskLevel,
};
