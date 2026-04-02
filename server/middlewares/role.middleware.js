const AppError = require("../utils/AppError");
const { normalizeRole, canAccessModule } = require("../config/roles");
const { deriveAllowedModulesFromPermissions } = require("../config/userPermissions");

/**
 * Middleware to restrict access to specific roles
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'user')
 */
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            console.error("RBAC Failure: Unified user context missing required role field.");
            return next(new AppError("User context not established. Please login again.", 401));
        }

        const userRole = normalizeRole(req.user.role);
        const allowedRoles = roles.map((role) => normalizeRole(role));

        if (!allowedRoles.includes(userRole)) {
            return next(
                new AppError(
                    `Unauthorized: Role [${req.user.role}] does not have required permissions for this protocol.`,
                    403
                )
            );
        }

        next();
    };
};

exports.authorizeModules = (...moduleKeys) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return next(new AppError("User context not established. Please login again.", 401));
        }

        const role = normalizeRole(req.user.role);
        const directPermissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];
        const directModules = deriveAllowedModulesFromPermissions(directPermissions);
        const allowed =
            moduleKeys.some((key) => directModules.includes(key)) ||
            moduleKeys.some((key) => canAccessModule(role, key));

        if (!allowed) {
            return next(new AppError(`Unauthorized: role [${role}] cannot access requested module.`, 403));
        }

        next();
    };
};
