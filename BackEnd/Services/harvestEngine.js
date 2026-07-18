const { generateHarvestStrategy } = require("./groqService");

async function analyzeHarvest({ answers = {} }) {
  try {
    return await generateHarvestStrategy(answers);
  } catch (error) {
    console.error("Harvest analysis failed:", error.message);
    throw error;
  }
}

module.exports = {
  analyzeHarvest,
};
