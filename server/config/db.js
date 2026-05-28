const mongoose = require("mongoose");
const dns = require("dns");
const logger = require("../utils/logger");

dns.setServers(['8.8.8.8']);

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        const safeTarget = mongoUri.includes("@") ? mongoUri.split("@").pop() : mongoUri.replace(/\/\/.*?:.*?@/, "//<redacted>@");
        logger.info(`Attempting to connect to MongoDB: ${safeTarget}`);
        await mongoose.connect(mongoUri);
        logger.info("MongoDB connected successfully");
    } catch (error) {
        logger.error(`MongoDB connection error: ${error.message}`);
        // Don't exit here, let the server handle it or retry
    }
};

module.exports = connectDB;
