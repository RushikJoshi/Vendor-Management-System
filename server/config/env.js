const env = require("env-var");
require("dotenv").config();

const configs = {
    PORT: env.get("PORT").default("5000").asPortNumber(),
    NODE_ENV: env.get("NODE_ENV").default("development").asString(),
    MONGODB_URI: env.get("MONGO_URI").required().asString(),
    JWT_SECRET: env.get("JWT_SECRET").required().asString(),
    JWT_EXPIRY: env.get("JWT_EXPIRY").default("1d").asString(),

    // Admin Credentials Override
    SYSTEM_EMAIL: env.get("EMAIL").asString(),
    SYSTEM_PASS: env.get("EMAIL_PASS").asString(),

    // Redis/Bull Config
    REDIS_HOST: env.get("REDIS_HOST").default("localhost").asString(),
    REDIS_PORT: env.get("REDIS_PORT").default("6379").asPortNumber(),
    REDIS_PASSWORD: env.get("REDIS_PASSWORD").asString(),

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: env.get("CLOUD_NAME").asString(),
    CLOUDINARY_API_KEY: env.get("CLOUD_KEY").asString(),
    CLOUDINARY_API_SECRET: env.get("CLOUD_SECRET").asString(),

    // SMTP
    SMTP_HOST: env.get("SMTP_HOST").asString(),
    SMTP_PORT: env.get("SMTP_PORT").asPortNumber(),
    SMTP_USER: env.get("SMTP_USER").asString(),
    SMTP_PASS: env.get("SMTP_PASS").asString()
};

module.exports = configs;
