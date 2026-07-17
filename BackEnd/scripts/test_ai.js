const mongoose = require("mongoose");
const path = require("path");

if (typeof process.loadEnvFile === "function") {
  process.loadEnvFile(path.join(__dirname, "..", ".env"));
}

const cropRecommendationService = require("../Services/cropRecommendationService");
const { recommendCrops } = require("../Services/cropEngine");

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cropDb");
  console.log("Connected to MongoDB for test.");

  try {
    // 1. Test cropRecommendationService.recommend
    console.log("\n--- Testing Crop Recommendation Service (Random Forest Scorer) ---");
    const rfRecommendations = await cropRecommendationService.recommend({
      pH: 6.5,
      clay: 30,
      sand: 40,
      silt: 30,
      organic_carbon: 1.0,
      temperature: 28,
      rainfall: 100,
      humidity: 60,
      wind: 10,
      elevation: 100
    });
    console.log(`Success: Found ${rfRecommendations.length} recommendations.`);
    console.log("Top recommendation:", rfRecommendations[0]);

    // 2. Test cropEngine.recommendCrops
    console.log("\n--- Testing Crop Engine ---");
    const engineResult = await recommendCrops({
      state: "Maharashtra",
      district: "Pune",
      landArea: 2,
      budget: 60000,
      labour: "medium",
      previousCrop: ""
    });
    console.log("Engine top crops:", engineResult.top_crops.map(c => ({ crop: c.crop, score: c.suitability_score })));

  } catch (error) {
    console.error("Test failed with error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("DB connection closed.");
  }
}

runTest();
