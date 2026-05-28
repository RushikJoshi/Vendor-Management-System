const env = require("env-var");
require("dotenv").config();

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
    throw new Error("MONGO_URI or MONGODB_URI is required");
}

const configs = {
    PORT: env.get("PORT").default("5000").asString(), // Relaxed to allow named pipes (iisnode)
    NODE_ENV: env.get("NODE_ENV").default("development").asString(),
    MONGODB_URI: mongoUri,
    JWT_SECRET: env.get("JWT_SECRET").required().asString(),
    JWT_EXPIRE: env.get("JWT_EXPIRE").default(env.get("JWT_EXPIRY").default("15m").asString()).asString(),
    JWT_EXPIRY: env.get("JWT_EXPIRY").default(env.get("JWT_EXPIRE").default("15m").asString()).asString(),
    REFRESH_TOKEN_SECRET: env.get("REFRESH_TOKEN_SECRET").required().asString(),
    REFRESH_TOKEN_EXPIRE: env.get("REFRESH_TOKEN_EXPIRE").default("7d").asString(),
    FRONTEND_URL: env.get("FRONTEND_URL").default("http://localhost:5173").asString(),
    CORS_ORIGIN: env.get("CORS_ORIGIN").default(env.get("FRONTEND_URL").default("http://localhost:5173").asString()).asString(),
    ALLOW_PUBLIC_COMPANY_ONBOARDING: env.get("ALLOW_PUBLIC_COMPANY_ONBOARDING").default("false").asBool(),

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
    SMTP_PASS: env.get("SMTP_PASS").asString(),

    // GST lookup integration
    GST_LOOKUP_PROVIDER: env.get("GST_LOOKUP_PROVIDER").default("derived").asString(),
    GST_LOOKUP_TIMEOUT_MS: env.get("GST_LOOKUP_TIMEOUT_MS").default("8000").asIntPositive(),
    GST_ATTESTR_BASE_URL: env.get("GST_ATTESTR_BASE_URL").default("https://api.attestr.com").asString(),
    GST_ATTESTR_VERSION: env.get("GST_ATTESTR_VERSION").default("v2").asString(),
    GST_ATTESTR_AUTH_TOKEN: env.get("GST_ATTESTR_AUTH_TOKEN").asString(),
    GST_GSTINCHECK_API_KEY: env.get("GST_GSTINCHECK_API_KEY").asString()
};

module.exports = configs;
