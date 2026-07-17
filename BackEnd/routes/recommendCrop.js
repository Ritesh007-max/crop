const express = require("express");
const router = express.Router();

const { getRegionOptions, recommendCrops } = require("../Services/cropEngine");
const { getWeatherForDistrict } = require("../Services/weatherService");
const { fetchCropProduction, getLocalCropNames } = require("../Services/govDataService");

/**
 * POST /recommend-crop/farm-input
 * Receives farmer inputs and returns top 3 crop recommendations.
 */
router.post("/farm-input", async (req, res) => {
  try {
    const result = await recommendCrops(req.body);
    res.json(result);
  } catch (error) {
    console.error("Recommendation error:", error.message);
    res.status(400).json({
      error: error.message || "Unable to recommend crops",
    });
  }
});

/**
 * POST /recommend-crop/ (backward compatibility)
 * Same as farm-input endpoint.
 */
router.post("/", async (req, res) => {
  try {
    const result = await recommendCrops(req.body);
    res.json(result);
  } catch (error) {
    console.error("Recommendation error:", error.message);
    res.status(400).json({
      error: error.message || "Unable to recommend crops",
    });
  }
});

/**
 * GET /recommend-crop/weather?state=X&district=Y
 * Fetch weather data for a specific district using Open-Meteo API.
 */
router.get("/weather", async (req, res) => {
  try {
    const { state, district } = req.query;

    if (!state || !district) {
      return res.status(400).json({
        error: "Both 'state' and 'district' query parameters are required.",
      });
    }

    const weather = await getWeatherForDistrict(state, district);
    res.json(weather);
  } catch (error) {
    console.error("Weather fetch error:", error.message);
    res.status(400).json({
      error: error.message || "Unable to fetch weather data",
    });
  }
});

/**
 * GET /recommend-crop/local-crops?state=X&district=Y
 * Returns crops historically grown in that district from India's
 * "District-wise, season-wise crop production statistics from 1997" dataset.
 */
router.get("/local-crops", async (req, res) => {
  try {
    const { state, district, limit } = req.query;

    if (!state || !district) {
      return res.status(400).json({
        error: "Both 'state' and 'district' query parameters are required.",
      });
    }

    const result = await fetchCropProduction(state, district, {
      limit: Number(limit) || 1000,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Gov crop data error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "Unable to fetch government crop data",
    });
  }
});

/**
 * GET /recommend-crop/recommend-crops?state=X&district=Y&landArea=Z&budget=B&labour=L&previousCrop=C
 * Runs crop scoring algorithm and returns top 3 crops via GET.
 * Also enriches the result with local crops from the govt dataset.
 */
router.get("/recommend-crops", async (req, res) => {
  try {
    const { state, district, landArea, budget, labour, previousCrop } =
      req.query;

    if (!state || !district) {
      return res.status(400).json({
        error: "Both 'state' and 'district' query parameters are required.",
      });
    }

    const input = {
      state,
      district,
      landArea: Number(landArea) || 1,
      budget: Number(budget) || 50000,
      labour: labour || "medium",
      previousCrop: previousCrop || "",
    };

    // Run AI scoring + govt crop lookup in parallel
    const [result, localCropNames] = await Promise.all([
      recommendCrops(input),
      getLocalCropNames(state, district),
    ]);

    // Mark each recommended crop as locally grown if it appears in govt data
    if (localCropNames.length > 0) {
      const localSet = new Set(localCropNames.map((c) => c.toLowerCase()));
      result.top_crops = result.top_crops.map((c) => ({
        ...c,
        locally_grown: localSet.has((c.crop || "").toLowerCase()),
      }));
    }

    result.local_crops = {
      source: "data.gov.in (Agmarknet – Ministry of Agriculture)",
      state,
      district,
      crops: localCropNames,
    };

    res.json(result);
  } catch (error) {
    console.error("Recommendation error:", error.message);
    res.status(400).json({
      error: error.message || "Unable to recommend crops",
    });
  }
});

/**
 * GET /recommend-crop/regions
 * Returns the list of states and districts.
 */
router.get("/regions", async (_req, res) => {
  try {
    const regions = await getRegionOptions();
    res.json(regions);
  } catch (error) {
    console.error("Region fetch error:", error.message);
    res.status(500).json({
      error: error.message || "Unable to fetch regions",
    });
  }
});

const cropRecommendationService = require("../Services/cropRecommendationService");
const districtCoordinates = require("../seed-data/districtCoordinates.json");
const { calculateCropScore } = require("../utils/scoring");

/**
 * POST /recommend-crop/from-location
 * Analyzes location GPS coordinates, queries geocoding, weather, soil grids, and elevation APIs,
 * and recommends crops using a simulated Random Forest match score.
 */
router.post("/from-location", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined || isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
      return res.status(400).json({ error: "Latitude and longitude are required." });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    // 1. Reverse Geocoding via Nominatim
    let state = "";
    let district = "";
    let country = "";

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&addressdetails=1`, {
        headers: { "User-Agent": "Seed2SuccessApp/1.0" },
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        const data = await response.json();
        const addr = data.address || {};
        country = addr.country || "India";
        state = addr.state || "";
        district = addr.county || addr.district || addr.state_district || addr.city || addr.town || "";
      }
    } catch (err) {
      console.warn("Nominatim reverse geocoding failed, using distance-based mapping fallback:", err.message);
    }

    // Geocoding Fallback: distance mapping to nearest coordinate in seed database
    if (!state || !district) {
      let closestState = "Andhra Pradesh";
      let closestDistrict = "West Godavari";
      let minDistance = Infinity;

      for (const [sName, districtsObj] of Object.entries(districtCoordinates)) {
        for (const [dName, coords] of Object.entries(districtsObj)) {
          const dist = Math.sqrt(
            Math.pow(coords.lat - lat, 2) + Math.pow(coords.lon - lon, 2)
          );
          if (dist < minDistance) {
            minDistance = dist;
            closestState = sName;
            closestDistrict = dName;
          }
        }
      }
      state = closestState;
      district = closestDistrict;
      country = country || "India";
    }

    // 2. SoilGrids API
    let pH = 6.5;
    let clay = 30;
    let sand = 40;
    let silt = 30;
    let organicCarbon = 1.0;

    try {
      const soilUrl = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=phh2o&property=clay&property=sand&property=silt&property=soc&depth=0-5cm&value=mean`;
      const response = await fetch(soilUrl, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        const data = await response.json();
        const layers = data.properties?.layers || [];
        
        const getMeanValue = (propName) => {
          const layer = layers.find(l => l.name === propName);
          const depthObj = layer?.depths?.find(d => d.label === "0-5cm");
          const val = depthObj?.values?.mean;
          return val != null ? val : null;
        };

        const rawPh = getMeanValue("phh2o");
        const rawClay = getMeanValue("clay");
        const rawSand = getMeanValue("sand");
        const rawSilt = getMeanValue("silt");
        const rawSoc = getMeanValue("soc");

        if (rawPh !== null) pH = rawPh / 10;
        if (rawClay !== null) clay = rawClay / 10;
        if (rawSand !== null) sand = rawSand / 10;
        if (rawSilt !== null) silt = rawSilt / 10;
        if (rawSoc !== null) organicCarbon = rawSoc / 10;
      }
    } catch (err) {
      console.warn("SoilGrids API failed, using default soil values:", err.message);
      // Keep the default values already assigned above
    }

    // 3. Open-Meteo Weather
    let temperature = 28;
    let rainfall = 100;
    let humidity = 60;
    let windSpeed = 10;

    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=precipitation,relativehumidity_2m`;
      const response = await fetch(weatherUrl, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        const data = await response.json();
        temperature = data.current_weather?.temperature ?? 28;
        windSpeed = data.current_weather?.windspeed ?? 10;

        const precHourly = data.hourly?.precipitation || [];
        const next24hPrec = precHourly.slice(0, 24);
        const dailyRain = next24hPrec.reduce((sum, v) => sum + (v || 0), 0);
        rainfall = dailyRain > 0 ? Math.round(dailyRain * 30) : 80;

        const humHourly = data.hourly?.relativehumidity_2m || [];
        const next24hHum = humHourly.slice(0, 24);
        if (next24hHum.length > 0) {
          humidity = Math.round(next24hHum.reduce((sum, v) => sum + (v || 0), 0) / next24hHum.length);
        }
      }
    } catch (err) {
      console.warn("Open-Meteo weather forecast failed:", err.message);
    }

    // 4. Open-Elevation
    let elevation = 150;
    try {
      const elevUrl = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`;
      const response = await fetch(elevUrl, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        const data = await response.json();
        elevation = data.results?.[0]?.elevation ?? 150;
      }
    } catch (err) {
      console.warn("Open-Elevation failed, using default elevation:", err.message);
      // Keep the default value already assigned above
    }

    // 5. Predict using Crop Recommendation Service + Govt local-crop data (in parallel)
    const [rfRecommendations, localCropsResult] = await Promise.all([
      cropRecommendationService.recommend({
        pH, clay, sand, silt, organic_carbon: organicCarbon,
        temperature, rainfall, humidity, wind: windSpeed, elevation
      }),
      fetchCropProduction(state, district, { limit: 1000 }).catch((err) => {
        console.warn("Govt crop data fetch failed (non-fatal):", err.message);
        return null;
      }),
    ]);

    // Build a set of locally-grown crops from govt data for cross-referencing
    const localCropNames = localCropsResult
      ? localCropsResult.crops.map((c) => c.crop)
      : [];
    const localSet = new Set(localCropNames.map((c) => c.toLowerCase()));

    // 6. Merge with scoring details for the frontend output format
    // crop_info is returned directly by recommend() — no JSON lookup needed
    const scoredCrops = rfRecommendations.map(rfItem => {
      const cropData = rfItem.crop_info;
      if (!cropData) return null;

      const scoredDetails = calculateCropScore({
        landArea: 1,
        budget: 50000,
        labour: "medium",
        previousCrop: ""
      }, cropData, {
        temperature,
        precipitation: rainfall / 30,
        humidity,
        location: { state, district }
      });

      // Set score to Random Forest match percentage
      scoredDetails.suitability_score = rfItem.matchPercent;

      // Tag whether this crop is confirmed as locally grown per govt data
      scoredDetails.locally_grown = localSet.has(
        (scoredDetails.crop || "").toLowerCase()
      );

      return scoredDetails;
    }).filter(Boolean);

    scoredCrops.sort((a, b) => b.suitability_score - a.suitability_score);
    const topCrops = scoredCrops.slice(0, 3);

    res.json({
      farmer_profile: {
        state,
        district,
        country,
        latitude: lat,
        longitude: lon,
      },
      weather_data: {
        temperature,
        precipitation: rainfall,
        humidity,
        windSpeed,
        elevation,
        location: { state, district, latitude: lat, longitude: lon },
      },
      soil_data: {
        pH,
        clay: parseFloat(clay.toFixed(1)),
        sand: parseFloat(sand.toFixed(1)),
        silt: parseFloat(silt.toFixed(1)),
        organicCarbon: parseFloat(organicCarbon.toFixed(2))
      },
      local_crops: {
        source: "data.gov.in – District-wise, season-wise crop production statistics (1997+)",
        state,
        district: localCropsResult?.district ?? district.toUpperCase(),
        unique_crops_count: localCropsResult?.unique_crops_count ?? 0,
        total_dataset_records: localCropsResult?.total_dataset_records ?? 0,
        crops: localCropsResult?.crops ?? [],
      },
      top_crops: topCrops,
      all_scores: scoredCrops.map(c => ({
        crop: c.crop,
        score: c.suitability_score,
        locally_grown: c.locally_grown,
      }))
    });
  } catch (error) {
    console.error("Location-based recommendation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate recommendations from location" });
  }
});

module.exports = router;
