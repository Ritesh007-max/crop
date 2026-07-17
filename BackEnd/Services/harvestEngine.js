const DEFAULT_CROP_PROFILE = {
  labourDaysPerAcre: 2.5,
  labourDailyRate: 500,
  machineCostPerAcre: 1800,
  postHarvestFocus: ["shade drying", "sorting", "bagging", "rodent-safe storage"],
};

const CROP_PROFILES = {
  paddy: {
    labourDaysPerAcre: 2.2,
    labourDailyRate: 550,
    machineCostPerAcre: 2000,
    postHarvestFocus: ["sun drying to safe moisture", "timely threshing", "clean tarpaulin handling", "aerated bag storage"],
  },
  rice: {
    labourDaysPerAcre: 2.2,
    labourDailyRate: 550,
    machineCostPerAcre: 2000,
    postHarvestFocus: ["sun drying to safe moisture", "timely threshing", "clean tarpaulin handling", "aerated bag storage"],
  },
  wheat: {
    labourDaysPerAcre: 1.8,
    labourDailyRate: 520,
    machineCostPerAcre: 1900,
    postHarvestFocus: ["drying before bagging", "avoid grain cracking", "clean storage bins", "stack on pallets"],
  },
  maize: {
    labourDaysPerAcre: 2.4,
    labourDailyRate: 500,
    machineCostPerAcre: 1750,
    postHarvestFocus: ["cob drying", "shelling at correct moisture", "fungus checks", "well-ventilated storage"],
  },
  cotton: {
    labourDaysPerAcre: 3.1,
    labourDailyRate: 600,
    machineCostPerAcre: 2200,
    postHarvestFocus: ["keep kapas dry", "prevent contamination", "separate graded lots", "covered transport"],
  },
  sugarcane: {
    labourDaysPerAcre: 4.2,
    labourDailyRate: 650,
    machineCostPerAcre: 2600,
    postHarvestFocus: ["quick dispatch to mill", "avoid field-stored cane", "bundle by lot", "maintain moisture during transit"],
  },
  tomato: {
    labourDaysPerAcre: 4.5,
    labourDailyRate: 550,
    machineCostPerAcre: 1200,
    postHarvestFocus: ["shade cooling", "crate handling", "grading damaged fruit", "fast dispatch to market"],
  },
  chili: {
    labourDaysPerAcre: 3.6,
    labourDailyRate: 540,
    machineCostPerAcre: 1300,
    postHarvestFocus: ["uniform drying", "avoid moisture re-entry", "sealed bags", "pest-safe storage"],
  },
};

const MATURITY_SCORES = {
  "Not yet ready": 30,
  "Nearly ready": 68,
  "Ready now": 88,
  Overdue: 97,
};

const WEATHER_IMPACT = {
  "Heavy rain": { score: 18, outlook: "Rainfall may delay cutting and raise field loss risk." },
  "High humidity": { score: 12, outlook: "Humidity can slow drying and increase fungal pressure after harvest." },
  "Extreme heat": { score: 10, outlook: "Heat can accelerate moisture loss and reduce quality if produce stays exposed." },
  "No weather concerns": { score: 0, outlook: "No major weather threat reported by the farmer." },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeBoolean(value) {
  return value === true || value === "yes" || value === "true";
}

function toPositiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeList(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
}

function getCropProfile(cropType) {
  if (!cropType) return DEFAULT_CROP_PROFILE;
  return CROP_PROFILES[String(cropType).trim().toLowerCase()] || DEFAULT_CROP_PROFILE;
}

function getVerdict(readinessScore) {
  if (readinessScore >= 90) return "Act Now";
  if (readinessScore >= 72) return "Ready";
  return "At Risk";
}

function buildWeatherRisk(weatherConcerns) {
  const concerns = normalizeList(weatherConcerns).filter(Boolean);
  const activeConcerns = concerns.length ? concerns : ["No weather concerns"];
  const risks = activeConcerns.map((concern) => ({
    concern,
    severity: WEATHER_IMPACT[concern]?.score >= 15 ? "High" : WEATHER_IMPACT[concern]?.score >= 10 ? "Moderate" : "Low",
    note: WEATHER_IMPACT[concern]?.outlook || "Monitor local forecasts before finalizing harvest operations.",
  }));
  const totalRisk = risks.reduce((sum, risk) => sum + (WEATHER_IMPACT[risk.concern]?.score || 0), 0);

  return {
    activeConcerns,
    risks,
    totalRisk,
    overallRisk: totalRisk >= 20 ? "High" : totalRisk >= 10 ? "Moderate" : "Low",
  };
}

function buildActionSteps({ readinessVerdict, weather, storageAvailable, transportArranged, equipmentAvailable, labourAvailable }) {
  const steps = [];

  steps.push({
    day: "Today",
    title: "Field decision",
    task:
      readinessVerdict === "Act Now"
        ? "Start harvest block planning immediately and prioritize the ripest area first."
        : "Mark the most mature plots and confirm grain or fruit moisture before full harvest.",
  });

  steps.push({
    day: "Next 24 hrs",
    title: "Resource lock-in",
    task: labourAvailable
      ? `Confirm worker attendance and${equipmentAvailable ? " machine timing" : " manual harvest tools"} for the first shift.`
      : "Book labour support now; current labour availability is insufficient for a timely harvest.",
  });

  steps.push({
    day: "Day 2",
    title: "Weather protection",
    task:
      weather.overallRisk === "High"
        ? "Advance harvest ahead of the risk window and prepare tarpaulins or covered stacking areas."
        : "Keep a short weather watch and schedule cutting during the driest period of the day.",
  });

  steps.push({
    day: "Day 3",
    title: "Post-harvest handling",
    task: storageAvailable
      ? "Move harvested produce into prepared storage after drying and grading."
      : "Arrange temporary dry shelter or immediate sale pickup to avoid field-side losses.",
  });

  steps.push({
    day: "Day 4",
    title: "Dispatch check",
    task: transportArranged
      ? "Dispatch according to market or mill schedule and document harvested volume."
      : "Secure transport before the remaining crop is cut to avoid pile-up after harvest.",
  });

  return steps;
}

function analyzeHarvest({ answers = {}, fileCount = 0 }) {
  const maturityStage = answers.maturityStage || "Nearly ready";
  const labourAvailable = normalizeBoolean(answers.labourAvailable);
  const equipmentAvailable = normalizeBoolean(answers.equipmentAvailable);
  const storageAvailable = normalizeBoolean(answers.storageAvailable);
  const transportArranged = normalizeBoolean(answers.transportArranged);
  const workersAvailable = labourAvailable ? toPositiveNumber(answers.workersAvailable, 4) : 0;
  const landSize = toPositiveNumber(answers.landSize, 5);
  const cropType = answers.cropType || "General crop";
  const cropProfile = getCropProfile(cropType);
  const weather = buildWeatherRisk(answers.weatherConcerns);

  const imageSignal = clamp(fileCount * 3, 0, 12);
  const storagePenalty = storageAvailable ? 0 : 8;
  const transportPenalty = transportArranged ? 0 : 6;
  const labourPenalty = labourAvailable ? 0 : 14;
  const equipmentPenalty = equipmentAvailable ? 0 : 6;

  const readinessScore = clamp(
    (MATURITY_SCORES[maturityStage] || 65) + imageSignal - weather.totalRisk - storagePenalty - transportPenalty,
    20,
    98
  );
  const readinessVerdict = getVerdict(readinessScore);

  const totalLabourDays = Math.max(1, Math.round(landSize * cropProfile.labourDaysPerAcre));
  const effectiveDailyCapacity = Math.max(
    0.5,
    (workersAvailable || 1) * (equipmentAvailable ? 1.4 : 1)
  );
  const estimatedHarvestDays = labourAvailable
    ? Math.max(1, Math.ceil(totalLabourDays / effectiveDailyCapacity))
    : Math.max(3, Math.ceil(totalLabourDays / 2));

  const labourCost = labourAvailable
    ? workersAvailable * cropProfile.labourDailyRate * estimatedHarvestDays
    : totalLabourDays * cropProfile.labourDailyRate;
  const operationsCost = Math.round(landSize * cropProfile.machineCostPerAcre * (equipmentAvailable ? 1 : 0.55));
  const transportCost = transportArranged ? Math.round(landSize * 350) : Math.round(landSize * 500);
  const storagePreparationCost = storageAvailable ? Math.round(landSize * 180) : Math.round(landSize * 320);
  const totalCost = labourCost + operationsCost + transportCost + storagePreparationCost;

  const bottlenecks = [];
  if (!labourAvailable) bottlenecks.push("labour shortage");
  if (!equipmentAvailable) bottlenecks.push("limited harvest equipment");
  if (!storageAvailable) bottlenecks.push("storage gap");
  if (!transportArranged) bottlenecks.push("transport not confirmed");
  if (weather.overallRisk !== "Low") bottlenecks.push("weather exposure");

  const bestHarvestWindow =
    readinessVerdict === "Act Now"
      ? "Harvest within the next 1-3 days."
      : readinessVerdict === "Ready"
        ? "Harvest within the next 4-7 days."
        : "Monitor maturity closely and prepare to harvest in 7-12 days.";

  return {
    summary: {
      cropType,
      landSize,
      maturityStage,
      readinessScore,
      fileCount,
    },
    cards: {
      harvestReadiness: {
        verdict: readinessVerdict,
        score: readinessScore,
        confidence: fileCount >= 3 ? "High" : fileCount >= 1 ? "Moderate" : "Low",
        reasons: [
          `Farmer marked the crop as "${maturityStage}".`,
          weather.overallRisk === "Low" ? "No major weather obstacles were reported." : `Weather risk is currently ${weather.overallRisk.toLowerCase()}.`,
          storageAvailable ? "Storage is available after harvest." : "Storage is not yet ready and may increase post-harvest losses.",
        ],
      },
      bestHarvestWindow: {
        recommendation: bestHarvestWindow,
        urgency: readinessVerdict === "Act Now" ? "Immediate" : readinessVerdict === "Ready" ? "Near-term" : "Prepare now",
        idealTimeOfDay: weather.activeConcerns.includes("Extreme heat") ? "Early morning" : "Late morning after surface moisture clears",
      },
      weatherRiskOutlook: {
        overallRisk: weather.overallRisk,
        risks: weather.risks,
        advisory:
          weather.overallRisk === "High"
            ? "Keep harvest flexible and protect cut produce from moisture exposure."
            : "Use the local forecast to lock the driest harvest window.",
      },
      labourAndTimeEstimate: {
        landSize: `${landSize} acres`,
        cropType,
        workersAvailable,
        labourAvailable,
        equipmentAvailable,
        labourDaysNeeded: totalLabourDays,
        estimatedHarvestDays,
        bottleneck: bottlenecks[0] || "resources aligned",
      },
      harvestCostEstimate: {
        labourCost,
        operationsCost,
        transportCost,
        storagePreparationCost,
        totalCost,
        note: equipmentPenalty > 0 ? "Manual harvesting will increase time pressure." : "Mechanized support reduces delay risk.",
      },
      postHarvestCare: {
        recommendations: [
          `Dry and grade the ${cropType.toLowerCase()} before stacking or dispatch.`,
          `Focus on ${cropProfile.postHarvestFocus[0]} and ${cropProfile.postHarvestFocus[1]}.`,
          storageAvailable ? "Use clean, ventilated storage and keep produce off the floor." : "Arrange temporary covered storage before peak harvest begins.",
          transportArranged ? "Load produce in batches to reduce waiting time after harvest." : "Avoid cutting more than can be moved the same day.",
        ],
      },
      harvestActionPlan: {
        steps: buildActionSteps({
          readinessVerdict,
          weather,
          storageAvailable,
          transportArranged,
          equipmentAvailable,
          labourAvailable,
        }),
      },
    },
  };
}

module.exports = {
  analyzeHarvest,
};
