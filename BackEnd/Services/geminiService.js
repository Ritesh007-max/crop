const fs = require("fs/promises");
const axios = require("axios");

function toBase64(buffer) {
  return buffer.toString("base64");
}

function cleanJsonResponse(text) {
  let cleaned = text.trim();
  // Remove markdown block if model outputs ```json ... ```
  cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return cleaned;
}

async function detectPlantHealth(imagePath) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY is not configured in your .env file.");
    error.statusCode = 500;
    throw error;
  }

  const imageBuffer = await fs.readFile(imagePath);
  const base64Image = toBase64(imageBuffer);

  const prompt = `You are an expert plant pathologist AI. Analyze this plant leaf/fruit image.
Identify the crop species (common name), and determine if it is healthy or diseased.
If it is diseased, identify the disease and provide treatment recommendations categorised into Chemical Medicines, Biological Cures, and Prevention.

You MUST respond ONLY with a valid JSON object. Do not include any markdown formatting (such as \`\`\`json or backticks), introduction, or other text outside the JSON.
The JSON object MUST contain precisely the following fields:
{
  "plant": "Common name of the plant (string, e.g. 'Tomato', 'Paddy / Rice', 'Gourd / Cucurbits')",
  "healthStatus": "either 'Healthy' or 'Diseased'",
  "confidence": 0.95,
  "isHealthy": true,
  "diseases": [
    {
      "name": "Name of the disease (or 'None' if healthy)",
      "probability": 0.95,
      "treatment": "💊 Medicines / Chemical:\n• [Specific chemical treatments or fertilizers]\n\n🌿 Cures / Biological:\n• [Specific biological cures/practices]\n\n🛡️ Prevention:\n• [Specific prevention techniques]"
    }
  ]
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image
            }
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 25000,
    });

    const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new Error("No response content from Gemini API.");
    }

    const cleanedContent = cleanJsonResponse(content);
    const parsedData = JSON.parse(cleanedContent);

    const diseases = Array.isArray(parsedData.diseases) ? parsedData.diseases : [];
    const isHealthy = typeof parsedData.isHealthy === "boolean" 
      ? parsedData.isHealthy 
      : (parsedData.healthStatus === "Healthy" || diseases.length === 0);

    return {
      plant: parsedData.plant || "Unknown",
      healthStatus: parsedData.healthStatus || (isHealthy ? "Healthy" : "Diseased"),
      confidence: Number(parsedData.confidence) || (diseases[0]?.probability) || 0.95,
      isHealthy,
      diseases: diseases.map(d => ({
        name: d.name || "Unknown disease",
        probability: Number(d.probability) || 0.95,
        treatment: d.treatment || "Consult an agronomist for treatment guidance."
      }))
    };
  } catch (error) {
    console.error("Gemini API inference error:", error);
    const message = error.response?.data?.error?.message || error.message || "Failed to contact Google AI Studio.";
    const serviceError = new Error(`Gemini Service Error: ${message}`);
    serviceError.statusCode = 502;
    throw serviceError;
  }
}

module.exports = {
  detectPlantHealth
};
