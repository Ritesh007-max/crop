const axios = require("axios");

function cleanJsonResponse(text) {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return cleaned;
}

async function generateSellingStrategy(answers, livePriceProfile) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured in your .env file.");
  }

  const prompt = `You are an expert agricultural economist and logistics planner. 
Your job is to analyze the farmer's crop details and current live market prices, then generate a highly reasoned, realistic selling strategy.
Take into account the crop's perishability, shelf life, local market dynamics, and the impact of the farmer's quality and logistics readiness.

FARMER INPUTS:
- Crop Type: ${answers.cropType || "Unknown"}
- Quantity: ${answers.quantityValue || 25} ${answers.quantityUnit || "quintals"}
- Selling Urgency: ${answers.sellingUrgency || "Ask the system for a recommendation"}
- Storage Available: ${answers.storageAvailable === "yes" ? "Yes" : "No"}
- Transport Arranged: ${answers.transportArranged === "yes" ? "Yes" : "No"}
- Quality Label: ${answers.qualityLabel || "Average lot"}
- Defect Level: ${answers.defectLabel || "Moderate defects"}
- Preferred Buyer Channel: ${answers.buyerPreference || "Request suggestion"}

LIVE MARKET PRICE DATA (Base):
- Low: ${livePriceProfile.low}
- High: ${livePriceProfile.high}
- Trend: ${livePriceProfile.trend}
- Source: ${livePriceProfile.source || "Static Baseline"}

INSTRUCTIONS:
1. Determine the 'saleReadiness' rating ("Ready", "Needs Sorting", or "Hold").
2. Mathematically adjust the Expected Price Range based on the lot's quality and defects (e.g. poor quality fetches lower than market average). 
3. Calculate realistic total logistics costs (transport, handling, storage if applicable).
4. Make a hard recommendation on whether to "Sell immediately", "Wait for better prices", "Store temporarily", or "Sort first, then sell". Consider the crop's perishability heavily here (e.g., don't tell them to store ripe tomatoes for weeks).

You MUST respond ONLY with a valid JSON object matching the exact structure below. Do not include markdown blocks or any other text.

{
  "summary": {
    "cropType": "Crop name",
    "quantity": 25,
    "quantityUnit": "quintals",
    "saleReadiness": "Ready / Needs Sorting / Hold"
  },
  "cards": {
    "saleReadiness": {
      "rating": "Ready / Needs Sorting / Hold",
      "score": 85,
      "note": "Short explanation of why it is ready or not."
    },
    "qualitySnapshot": {
      "rating": "Strong / Mixed / At Risk",
      "strengths": ["list", "of", "strengths"],
      "defects": ["list", "of", "defects"]
    },
    "estimatedPriceRange": {
      "low": 1800,
      "high": 2400,
      "unit": "per quintal/kg",
      "expectedRevenue": 50000,
      "source": "${livePriceProfile.source || "Static Baseline"}"
    },
    "historicalPriceContext": {
      "trend": "above average / average / below average",
      "note": "Context on the price"
    },
    "costAndMarginView": {
      "bestCaseMargin": 45000,
      "averageCaseMargin": 40000,
      "cautiousCaseMargin": 35000,
      "totalSellingCost": 5000
    },
    "sellNowVsStore": {
      "recommendation": "Sell now / Wait for better prices / Store temporarily / Sort first",
      "rationale": "Economic explanation considering perishability and costs."
    },
    "storagePartnerOptions": {
      "options": [
         { "name": "Local PACS Storage", "capacity": "60 bags", "cost": "INR 9/bag/day", "distance": "4 km" }
      ]
    },
    "transportOptions": {
      "options": [
         { "route": "Village to mandi", "vehicle": "Mini truck", "cost": "INR 1,800", "eta": "Same day", "note": "..." }
      ]
    },
    "buyerVisibility": {
      "preferredChannel": "Mandi / Contractor / Local buyer / Platform",
      "buyers": [
         { "name": "Trader", "channel": "Mandi", "priceRange": "Market linked", "note": "Quick sale" }
      ]
    }
  }
}
`;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from Groq API");
    }

    const cleaned = cleanJsonResponse(content);
    return JSON.parse(cleaned);

  } catch (error) {
    console.error("Groq Service Error:", error.response?.data || error.message);
    throw new Error("Failed to generate selling strategy using Groq API");
  }
}

module.exports = {
  generateSellingStrategy
};
