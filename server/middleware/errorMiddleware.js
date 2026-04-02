const logger = require("../utils/logger");
const { errorResponse } = require("../utils/responseHandler");

const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Something went wrong";
    let errors = err.errors || null;

    // Log the error
    if (statusCode >= 500) {
        logger.error(`${err.name}: ${err.message} \n ${err.stack}`);
    } else {
        logger.warn(`${err.name}: ${err.message}`);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation Error";
        errors = Object.values(err.errors).map((val) => val.message);
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token. Please log in again.";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Your token has expired. Please log in again.";
    }

    // Operational vs Programming errors
    return errorResponse(res, message, {
        errors,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    }, statusCode);
};

module.exports = errorMiddleware;
