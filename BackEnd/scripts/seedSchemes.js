const path = require("path");
const mongoose = require("mongoose");

// Load env
if (typeof process.loadEnvFile === "function") {
  process.loadEnvFile(path.join(__dirname, "..", ".env"));
}

const connectDB = require("../Config/db");
const Scheme = require("../Modules/scheme");
const schemes = require("../seed-data/schemes.json");

async function seedSchemes() {
  try {
    await connectDB();

    // Clear existing schemes
    const deleted = await Scheme.deleteMany({});
    console.log(`Cleared ${deleted.deletedCount} existing schemes.`);

    // Insert new schemes
    const inserted = await Scheme.insertMany(schemes);
    console.log(`Successfully seeded ${inserted.length} government schemes.`);

    // Verify
    const count = await Scheme.countDocuments();
    console.log(`Total schemes in database: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding schemes:", error.message);
    process.exit(1);
  }
}

seedSchemes();
