const rateLimit = require("express-rate-limit");
const mongoSanitize = require("mongo-sanitize");
const xss = require("xss-clean");
const logger = require("../utils/logger");

const isDevelopment = process.env.NODE_ENV !== "production";
const loginPaths = new Set(["/auth/login", "/v1/auth/login"]);

// Rate limiting for general API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDevelopment ? 1000 : 100,
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes"
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => loginPaths.has(req.path),
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: isDevelopment ? 15 * 60 * 1000 : 60 * 60 * 1000,
    max: isDevelopment ? 50 : 10,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: isDevelopment
            ? "Too many login attempts, please try again after 15 minutes"
            : "Too many login attempts, please try again after an hour"
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logger.warn(`Brute force attempt detected from IP: ${req.ip}`);
        res.status(options.statusCode).send(options.message);
    }
});

// Middleware to sanitize NoSQL injections
const sanitizeRequest = (req, res, next) => {
    if (req.body) req.body = mongoSanitize(req.body);
    // req.query and req.params are often read-only in modern Express setups
    // skipping them to avoid "Cannot set property query of # which has only a getter"
    next();
};

module.exports = {
    apiLimiter,
    authLimiter,
    sanitizeRequest
};
