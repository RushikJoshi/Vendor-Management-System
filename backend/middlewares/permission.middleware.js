const AppError = require("../utils/AppError");
const { normalizeRole } = require("../config/roles");

/**
 * Middleware to check if the user's custom role has specific permissions
 * @param {...string} requiredPermissions - The permission names requested
 */
exports.checkPermission = (...requiredPermissions) => {
    return (req, res, next) => {
        // req.userRole was attached by protect middleware
        if (normalizeRole(req.user.role) === "admin") return next();

        if (!req.userRole || !req.userRole.permissions) {
            return next(new AppError("You do not have the permissions for this action", 403));
        }

        const userPermissions = req.userRole.permissions.map(p => p.name);
        const hasPermission = requiredPermissions.every(perm => userPermissions.includes(perm));

        if (!hasPermission) {
            return next(new AppError("You do not have the required permissions: " + requiredPermissions.join(", "), 403));
        }

        next();
    };
};

/**
 * Middleware to check if the user has access to a specific UI Module
 * Useful for filtering sidebar or panel access
 * @param {string} moduleName - e.g., "HR", "Inventory"
 */
exports.checkModuleAccess = (moduleName) => {
    return (req, res, next) => {
        if (normalizeRole(req.user.role) === "admin") return next();

        if (!req.userRole || !req.userRole.accessibleModules) {
            return next(new AppError("No module access defined for your role", 403));
        }

        if (!req.userRole.accessibleModules.includes(moduleName)) {
            return next(new AppError(`You do not have access to the ${moduleName} module`, 403));
        }

        next();
    };
};

/**
 * Action-level guard using role.accessibleModules string keys.
 * Example keys: users.view, users.create, rfq.approve, settings.access
 */
exports.checkActionAccess = (...actionKeys) => {
    return (req, res, next) => {
        if (normalizeRole(req.user?.role) === "admin") return next();

        const userActions = Array.isArray(req.user?.permissions) && req.user.permissions.length > 0
            ? req.user.permissions
            : Array.isArray(req.userRole?.accessibleModules)
            ? req.userRole.accessibleModules
            : [];

        const hasAccess = actionKeys.every((key) => userActions.includes(key));
        if (!hasAccess) {
            return next(new AppError("You do not have required action permissions for this endpoint", 403));
        }

        next();
    };
};
