const mongoose = require("mongoose");
require("dotenv").config();

class DatabaseConfig {
  constructor() {
    this.connectionString = process.env.MONGODB_URI;
    console.log("ENV MONGODB_URI:", process.env.MONGODB_URI);
  }

  async connect() {
    try {
      await mongoose.connect(this.connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅ Connected to MongoDB Atlas");
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      process.exit(1);
    }
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log("📤 Disconnected from MongoDB");
    } catch (error) {
      console.error("❌ MongoDB disconnection error:", error);
    }
  }
}

module.exports = DatabaseConfig;
