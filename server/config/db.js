const mongoose = require("mongoose");
const dns = require("dns");
const logger = require("../utils/logger");

dns.setServers(['8.8.8.8']);

const connectDB = async () => {
    try {
        logger.info(`Attempting to connect to MongoDB: ${process.env.MONGO_URI.split('@')[1]}`); // Log only the host part for security
        await mongoose.connect(process.env.MONGO_URI);
        logger.info("MongoDB connected successfully");
    } catch (error) {
        logger.error(`MongoDB connection error: ${error.message}`);
        // Don't exit here, let the server handle it or retry
    }
};

module.exports = connectDB;
