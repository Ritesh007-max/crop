const express = require("express");
const cors = require("cors");
const path = require("path");

const recommendRoute = require("./routes/recommendCrop");
const cropHealthRoute = require("./routes/cropHealth");
const harvestRoute = require("./routes/harvest");
const sellingRoute = require("./routes/selling");
const diseaseDetectionRoute = require("./routes/diseaseDetectionRoutes");
const authRoute = require("./routes/auth");
const cropPredictionRoute = require("./routes/crop_prediction_route");
const schemesRoute = require("./routes/schemes");
const connectDB = require("./Config/db");

// Environment configuration
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/recommend-crop", recommendRoute);
app.use("/api/crop-health", cropHealthRoute);
app.use("/api/harvest", harvestRoute);
app.use("/api/selling", sellingRoute);
app.use("/api", diseaseDetectionRoute);
app.use("/api", cropPredictionRoute);
app.use("/api/auth", authRoute);
app.use("/api/schemes", schemesRoute);

// Database connection and startup
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Database connection failed:", err.message);
  // Start server anyway to allow logic to work with fallbacks
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (Database Offline)`);
  });
});
