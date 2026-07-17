/**
 * seedDatabase.js
 *
 * NOTE: crops.json and regions.json have been removed.
 * This script now only seeds district coordinates from districtCoordinates.json.
 * Crops and regions must be inserted into MongoDB manually or via a different process.
 */

const path = require("path");

const connectDB = require("../Config/db");
const DistrictCoordinate = require("../Modules/district");

if (typeof process.loadEnvFile === "function") {
  process.loadEnvFile(path.join(__dirname, "..", ".env"));
}

const districtCoordinates = require("../seed-data/districtCoordinates.json");

function buildDistrictDocs(coordinateMap) {
  return Object.entries(coordinateMap).flatMap(([state, districts]) =>
    Object.entries(districts).map(([district, coords]) => ({
      state,
      district,
      lat: coords.lat,
      lon: coords.lon,
    }))
  );
}

async function seedDatabase() {
  await connectDB();

  const districtDocs = buildDistrictDocs(districtCoordinates);

  await DistrictCoordinate.deleteMany({});
  await DistrictCoordinate.insertMany(districtDocs);

  console.log(`Seeded ${districtDocs.length} district coordinates.`);
  console.log("Note: crops and regions must be seeded separately into MongoDB.");
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Database seed failed:", error.message);
    process.exit(1);
  });
