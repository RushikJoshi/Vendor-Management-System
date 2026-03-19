const rateLimit = require("express-rate-limit");
const mongoSanitize = require("mongo-sanitize");
const xss = require("xss-clean");
const logger = require("../utils/logger");

// Rate limiting for general API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes"
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login attempts per hour
    message: {
        success: false,
        message: "Too many login attempts, please try again after an hour"
    },
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
