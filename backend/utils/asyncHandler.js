/**
 * Async Handler Wrapper for controllers
 * Eliminates the need for repetitive try-catch blocks in async controllers
 * Automatically catches errors and passes them to the next middleware (global error handler)
 *
 * @param {Function} fn - The asynchronous controller function
 * @returns {Function} - The wrapped controller function
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = asyncHandler;
