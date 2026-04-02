const Redis = require("ioredis");
const configs = require("./env");
const logger = require("../utils/logger");

const redisConfig = {
    host: configs.REDIS_HOST,
    port: configs.REDIS_PORT,
    password: configs.REDIS_PASSWORD,
    maxRetriesPerRequest: 0,
    enableOfflineQueue: false,
    connectTimeout: 500,
};

const redisConnection = new Redis(redisConfig);

redisConnection.on("connect", () => {
    logger.info("Connected to Redis");
});

redisConnection.on("error", (err) => {
    if (!redisConnection._errorLogged) {
        logger.warn("Redis Cache system is offline (No local Redis detected). Main functionality is unaffected.");
        redisConnection._errorLogged = true;
    }
});

module.exports = redisConnection;
