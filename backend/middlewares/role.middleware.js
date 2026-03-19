const AppError = require("../utils/AppError");

/**
 * Middleware to restrict access to specific roles
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'user')
 */
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // req.user is attached by the 'protect' middleware
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    "You are not authorized to access this resource",
                    403
                )
            );
        }

        next();
    };
};
