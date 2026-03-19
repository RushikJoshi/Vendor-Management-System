/**
 * Custom Error Class to handle operational errors
 * Extends the built-in Error class
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true; // Flag to identify trusted operational errors

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
