/**
 * govDataService.js
 *
 * Fetches crop production data from the India Government Open Data portal
 * (data.gov.in) using the dataset:
 *   "District-wise, season-wise crop production statistics from 1997"
 *   Resource ID: 35be999b-0208-4354-b557-f6ca9a5355de
 *   Ministry of Agriculture and Farmers Welfare
 *
 * Fields returned: State_Name, District_Name, Crop_Year, Season, Crop, Area, Production
 *
 * This gives us historical evidence of which crops are actually GROWN
 * in a given district — used to enrich Phase 1 Planning recommendations.
 */

require("dotenv").config();

const GOV_API_KEY = process.env.DATA_SET;

// District-wise, season-wise crop production statistics from 1997
const RESOURCE_ID = "35be999b-0208-4354-b557-f6ca9a5355de";
const BASE_URL = "https://api.data.gov.in/resource";

/**
 * The dataset stores district names in ALL CAPS (e.g., "PUNE", "AHMEDNAGAR").
 * Normalise the input district for matching.
 */
function normaliseDistrict(name) {
  return (name || "").trim().toUpperCase();
}

/**
 * Normalise a crop name to Title Case for consistent display.
 */
function normaliseCrop(raw) {
  if (!raw || typeof raw !== "string") return null;
  return raw
    .trim()
    .split(/[\s/]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Fetch historical crop production data for a given state + district
 * from the government's district-wise crop production statistics dataset.
 *
 * @param {string} state     - e.g. "Maharashtra"
 * @param {string} district  - e.g. "Pune" (case-insensitive; normalised internally)
 * @param {object} [options]
 * @param {number} [options.limit=1000]     - max records to fetch
 * @param {number} [options.timeoutMs=8000]
 * @returns {Promise<CropProductionResult>}
 */
async function fetchCropProduction(state, district, options = {}) {
  const { limit = 1000, timeoutMs = 8000 } = options;

  if (!GOV_API_KEY) {
    throw new Error("DATA_SET env variable (govt API key) is not set.");
  }
  if (!state || !district) {
    throw new Error("Both 'state' and 'district' are required.");
  }

  const districtUpper = normaliseDistrict(district);

  const url =
    `${BASE_URL}/${RESOURCE_ID}` +
    `?api-key=${GOV_API_KEY}` +
    `&format=json` +
    `&limit=${limit}` +
    `&filters[state_name]=${encodeURIComponent(state)}` +
    `&filters[district_name]=${encodeURIComponent(districtUpper)}`;

  let data;
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`data.gov.in API responded with HTTP ${response.status}`);
    }

    data = await response.json();
  } catch (err) {
    throw new Error(`Failed to fetch government crop data: ${err.message}`);
  }

  if (!data || data.status !== "ok") {
    throw new Error(
      `Government API returned an unexpected response: ${data?.message || "unknown"}`
    );
  }

  const records = data.records || [];
  const total = data.total || 0;

  // Aggregate by crop: sum area & production across all years and seasons
  const cropMap = new Map();
  // cropName -> { totalArea, totalProduction, seasons: Set, years: { min, max }, recordCount }

  for (const record of records) {
    const cropName = normaliseCrop(record.crop);
    if (!cropName) continue;

    if (!cropMap.has(cropName)) {
      cropMap.set(cropName, {
        totalArea: 0,
        totalProduction: 0,
        seasons: new Set(),
        minYear: Infinity,
        maxYear: -Infinity,
        recordCount: 0,
      });
    }

    const entry = cropMap.get(cropName);
    entry.totalArea += Number(record.area_) || 0;
    entry.totalProduction += Number(record.production_) || 0;
    entry.recordCount += 1;

    if (record.season) entry.seasons.add(record.season.trim());
    const year = Number(record.crop_year);
    if (!isNaN(year)) {
      if (year < entry.minYear) entry.minYear = year;
      if (year > entry.maxYear) entry.maxYear = year;
    }
  }

  // Build sorted list — highest total production first
  const crops = Array.from(cropMap.entries())
    .sort((a, b) => b[1].totalProduction - a[1].totalProduction)
    .map(([name, meta]) => ({
      crop: name,
      total_area_ha: Math.round(meta.totalArea),
      total_production_tonnes: Math.round(meta.totalProduction),
      seasons: Array.from(meta.seasons),
      year_range:
        meta.minYear !== Infinity
          ? `${meta.minYear}–${meta.maxYear}`
          : "unknown",
      records: meta.recordCount,
    }));

  return {
    state,
    district: districtUpper,
    source: "data.gov.in – District-wise, season-wise crop production statistics (1997+)",
    total_dataset_records: total,
    records_fetched: records.length,
    unique_crops_count: crops.length,
    crops,
  };
}

/**
 * Returns only the sorted list of crop name strings for a district.
 * Fails silently — returns [] on any error.
 *
 * @param {string} state
 * @param {string} district
 * @returns {Promise<string[]>}
 */
async function getLocalCropNames(state, district) {
  try {
    const result = await fetchCropProduction(state, district, { limit: 1000 });
    return result.crops.map((c) => c.crop);
  } catch {
    return [];
  }
}

/**
 * Fetch current daily mandi prices from the government APMC dataset.
 * Filters by state, district, and commodity.
 *
 * @param {string} state
 * @param {string} district
 * @param {string} commodity
 * @returns {Promise<{ low: number, high: number, modal: number, count: number, source: string } | null>}
 */
async function fetchLiveMandiPrices(state, district, commodity) {
  if (!GOV_API_KEY) return null;
  if (!state || !commodity) return null;

  const resourceId = "9ef84268-d588-465a-a308-a864a43d0070";
  const normalisedState = state.trim();
  const normalisedDistrict = district ? district.trim() : null;

  let url = `${BASE_URL}/${resourceId}?api-key=${GOV_API_KEY}&format=json&limit=100&filters[state]=${encodeURIComponent(normalisedState)}`;
  
  if (normalisedDistrict) {
    url += `&filters[district]=${encodeURIComponent(normalisedDistrict)}`;
  }

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) return null;
    const data = await response.json();
    
    if (!data || data.status !== "ok" || !data.records || data.records.length === 0) {
      if (normalisedDistrict) {
        // Fallback: try state-only if district query had no records
        return fetchLiveMandiPrices(state, null, commodity);
      }
      return null;
    }

    const records = data.records;
    const targetCrop = commodity.toLowerCase();
    const matchingRecords = records.filter(r => 
      String(r.commodity || "").toLowerCase().includes(targetCrop) ||
      targetCrop.includes(String(r.commodity || "").toLowerCase())
    );

    if (matchingRecords.length === 0) {
      if (normalisedDistrict) {
        // Fallback: try state-only if district query had no matches
        return fetchLiveMandiPrices(state, null, commodity);
      }
      return null;
    }

    let totalMin = 0;
    let totalMax = 0;
    let totalModal = 0;
    let count = 0;

    for (const r of matchingRecords) {
      const minVal = Number(r.min_price);
      const maxVal = Number(r.max_price);
      const modalVal = Number(r.modal_price);
      
      if (!isNaN(minVal) && !isNaN(maxVal) && !isNaN(modalVal)) {
        totalMin += minVal;
        totalMax += maxVal;
        totalModal += modalVal;
        count++;
      }
    }

    if (count === 0) return null;

    return {
      low: Math.round(totalMin / count),
      high: Math.round(totalMax / count),
      modal: Math.round(totalModal / count),
      count: count,
      source: `Mandi daily market data (${matchingRecords[0].market || "local market"})`
    };
  } catch (err) {
    console.error("Failed to fetch live Mandi prices:", err.message);
    return null;
  }
}

module.exports = {
  fetchCropProduction,
  getLocalCropNames,
  fetchLiveMandiPrices,
};
