const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.warn(
      "MongoDB connection skipped: MONGO_URI is missing. Falling back to seed data."
    );
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.warn(
      `MongoDB connection failed: ${error.message}. Falling back to seed data.`
    );
    return false;
  }
}

module.exports = connectDB;
