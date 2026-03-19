/**
 * Standardized API Response Handler
 */
const sendResponse = (res, statusCode, success, message, data = null, error = null) => {
    return res.status(statusCode).json({
        success,
        message,
        data,
        error
    });
};

const successResponse = (res, message, data = null, statusCode = 200, pagination = null) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        pagination,
        error: null
    });
};

const errorResponse = (res, message, error = null, statusCode = 500) => {
    return sendResponse(res, statusCode, false, message, null, error);
};

module.exports = {
    sendResponse,
    successResponse,
    errorResponse
};
