const AppError = require("../utils/AppError");

/**
 * Middleware to check if the user is within their role's range limit
 * @param {string} amountField - Field name in req.body for the amount to check
 */
exports.checkRoleLimit = (amountField = "amount") => {
    return (req, res, next) => {
        // req.userRole is attached by 'protect' middleware after my recent update
        if (!req.userRole) {
            // If no custom role found, might be a default 'admin' or something that bypasses limits
            if (req.user.role === "admin") return next();
            return next(new AppError("User role details not found. Action restricted.", 403));
        }

        const amount = Number(req.body[amountField]);
        const { minLimit, maxLimit } = req.userRole;

        // If limits are 0, it means no limit (or not set)
        if (maxLimit > 0 && amount > maxLimit) {
            return next(new AppError(`Action exceeds your role's maximum limit of ${maxLimit}. Requires approval from higher authority.`, 403));
        }
        
        if (minLimit > 0 && amount < minLimit) {
            return next(new AppError(`Action is below your role's minimum threshold of ${minLimit}.`, 403));
        }

        next();
    };
};
