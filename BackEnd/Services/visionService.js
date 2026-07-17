const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const LABEL_WHITELIST = [
  "plant",
  "leaf",
  "crop",
  "fungus",
  "disease",
  "pest",
  "blight",
  "rust",
  "mildew",
  "agriculture",
  "flora",
];

function readImageAsBase64(imagePath) {
  return fs.readFileSync(imagePath, { encoding: "base64" });
}

function createJwt(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: OAUTH_TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createSign("RSA-SHA256")
    .update(unsignedToken)
    .sign(serviceAccount.private_key, "base64url");

  return `${unsignedToken}.${signature}`;
}

async function getGoogleAuthConfig() {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, "utf8")
    );
    const assertion = createJwt(serviceAccount);

    const tokenResponse = await axios.post(
      OAUTH_TOKEN_URL,
      new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 15000,
      }
    );

    return {
      headers: {
        Authorization: `Bearer ${tokenResponse.data.access_token}`,
      },
      url: VISION_API_URL,
    };
  }

  if (process.env.GOOGLE_VISION_API_KEY) {
    return {
      headers: {},
      url: `${VISION_API_URL}?key=${process.env.GOOGLE_VISION_API_KEY}`,
    };
  }

  const error = new Error(
    "Google Vision credentials are not configured. Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON path or GOOGLE_VISION_API_KEY."
  );
  error.statusCode = 500;
  throw error;
}

function filterLabels(labelAnnotations = []) {
  const rawLabels = labelAnnotations.map((label) => ({
    name: label.description,
    score: Number(label.score) || 0,
  }));

  const labels = rawLabels
    .filter((label) =>
      LABEL_WHITELIST.some((keyword) =>
        label.name.toLowerCase().includes(keyword)
      )
    )
    .map((label) => label.name);

  return {
    labels: labels.length > 0 ? labels : rawLabels.slice(0, 6).map((label) => label.name),
    rawLabels,
  };
}

async function detectVisionLabels(imagePath) {
  const imageBase64 = readImageAsBase64(imagePath);
  const authConfig = await getGoogleAuthConfig();

  try {
    const response = await axios.post(
      authConfig.url,
      {
        requests: [
          {
            image: {
              content: imageBase64,
            },
            features: [
              {
                type: "LABEL_DETECTION",
                maxResults: 10,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          ...authConfig.headers,
        },
        timeout: 20000,
      }
    );

    const visionPayload = response.data?.responses?.[0];

    if (visionPayload?.error?.message) {
      throw new Error(visionPayload.error.message);
    }

    return filterLabels(visionPayload?.labelAnnotations || []);
  } catch (error) {
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      "Google Vision API request failed.";
    const serviceError = new Error(message);
    serviceError.statusCode = 502;
    throw serviceError;
  }
}

module.exports = {
  detectVisionLabels,
};
