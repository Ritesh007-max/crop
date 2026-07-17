const Crop = require("../Modules/crops");

/**
 * Heuristic Crop Recommendation Engine simulating a Random Forest Classifier output.
 * Takes 10 inputs: pH, clay, sand, silt, organic_carbon, temperature, rainfall, humidity, wind, elevation.
 * Returns crops sorted by suitability percentage.
 * Data source: MongoDB (Crop collection).
 */
async function recommend(input) {
  const {
    pH = 6.5,
    clay = 30,
    sand = 40,
    silt = 30,
    organic_carbon = 1.0,
    temperature = 28,
    rainfall = 100,
    humidity = 60,
    wind = 10,
    elevation = 100
  } = input;

  const crops = await Crop.find({}).lean();

  if (!crops || crops.length === 0) {
    throw new Error("No crops found in MongoDB for Random Forest scoring.");
  }

  const scoredCrops = crops.map(crop => {
    let score = 0;
    let maxScore = 0;

    // 1. Temperature (Weight: 15)
    maxScore += 15;
    const tMin = crop.ideal_temp_min;
    const tMax = crop.ideal_temp_max;
    if (temperature >= tMin && temperature <= tMax) {
      score += 15;
    } else {
      const dist = Math.min(Math.abs(temperature - tMin), Math.abs(temperature - tMax));
      score += Math.max(0, 15 - dist * 2.5);
    }

    // 2. Rainfall (Weight: 15)
    maxScore += 15;
    const rMin = crop.rainfall_min;
    const rMax = crop.rainfall_max;
    if (rainfall >= rMin && rainfall <= rMax) {
      score += 15;
    } else {
      const dist = Math.min(Math.abs(rainfall - rMin), Math.abs(rainfall - rMax));
      score += Math.max(0, 15 - (dist / 8));
    }

    // 3. Humidity (Weight: 10)
    maxScore += 10;
    const waterReq = (crop.water_requirement || "").toLowerCase();
    const idealHum = waterReq === "high" ? 80 : waterReq === "low" ? 40 : 60;
    const humDist = Math.abs(humidity - idealHum);
    score += Math.max(0, 10 - humDist * 0.3);

    // 4. Soil pH (Weight: 15)
    maxScore += 15;
    const isRice = crop.crop_name === "Rice";
    const idealPhMin = isRice ? 5.0 : 6.0;
    const idealPhMax = isRice ? 6.5 : 7.5;
    if (pH >= idealPhMin && pH <= idealPhMax) {
      score += 15;
    } else {
      const dist = Math.min(Math.abs(pH - idealPhMin), Math.abs(pH - idealPhMax));
      score += Math.max(0, 15 - dist * 8);
    }

    // 5. Soil Texture (Weight: 20)
    maxScore += 20;
    const name = crop.crop_name;
    if (["Rice", "Sugarcane", "Jute"].includes(name)) {
      // Clayey preference
      if (clay > 35) score += 20;
      else if (clay > 20) score += 10;
      else score += 2;
    } else if (["Groundnut", "Onion", "Banana"].includes(name)) {
      // Sandy preference
      if (sand > 45) score += 20;
      else if (sand > 25) score += 10;
      else score += 2;
    } else {
      // Loamy preference (balanced)
      const balance = Math.abs(clay - silt) + Math.abs(sand - silt);
      score += Math.max(2, 20 - balance * 0.4);
    }

    // 6. Organic Carbon (Weight: 10)
    maxScore += 10;
    const prefSoc = ["Rice", "Banana", "Jute"].includes(name) ? 1.5 : 0.8;
    if (organic_carbon >= prefSoc) {
      score += 10;
    } else {
      score += Math.max(2, 10 - (prefSoc - organic_carbon) * 6);
    }

    // 7. Elevation & Wind (Weight: 15)
    maxScore += 15;
    const idealElev = name === "Wheat" ? 800 : 200;
    const elevDist = Math.abs(elevation - idealElev);
    score += Math.max(0, 15 - (elevDist / 80) - Math.abs(wind - 12) * 0.4);

    const matchPercent = Math.round((score / maxScore) * 100);

    return {
      crop: crop.crop_name,
      matchPercent: Math.min(99, Math.max(30, matchPercent)),
      crop_info: crop
    };
  });

  // Sort by matchPercent descending
  scoredCrops.sort((a, b) => b.matchPercent - a.matchPercent);

  return scoredCrops;
}

module.exports = {
  recommend
};
