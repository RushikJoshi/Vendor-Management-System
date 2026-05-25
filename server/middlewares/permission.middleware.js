const AppError = require("../utils/AppError");
const { normalizeRole } = require("../config/roles");
const {
    ACTION_TO_MODULE_KEYS,
    getEffectivePermissionKeys,
    normalizePermissionKey,
    hasPermission,
} = require("../config/userPermissions");

const MODULE_ALIAS_MAP = {
    dashboard: "dashboard",
    vendors: "vendor_forms",
    "vendor forms": "vendor_forms",
    vendor_forms: "vendor_forms",
    "form builder": "form_builder",
    form_builder: "form_builder",
    rfqs: "rfq",
    rfq: "rfq",
    contracts: "contracts",
    analytics: "analytics",
    users: "users",
    roles: "roles",
    settings: "settings",
    submissions: "submissions",
};

function normalizeLegacyAccessEntries(entries = []) {
    if (!Array.isArray(entries)) return [];

    return [
        ...new Set(
            entries
                .map((entry) => String(entry || "").trim().toLowerCase())
                .filter(Boolean)
                .map((entry) => {
                    if (entry.includes(".")) {
                        return normalizePermissionKey(entry);
                    }
                    return MODULE_ALIAS_MAP[entry] || entry.replace(/\s+/g, "_");
                })
        ),
    ];
}

function hasLegacyRoleAccess(roleDetails, requiredPermission) {
    const required = normalizePermissionKey(requiredPermission);
    if (!required) return false;

    const legacyEntries = normalizeLegacyAccessEntries(roleDetails?.accessibleModules);
    if (legacyEntries.length === 0) return false;

    if (legacyEntries.includes(required)) {
        return true;
    }

    const mappedModules = ACTION_TO_MODULE_KEYS[required] || [];
    return mappedModules.some((moduleKey) => legacyEntries.includes(moduleKey));
}

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

        const normalizedRequired = actionKeys.map(normalizePermissionKey).filter(Boolean);
        const userActions = getEffectivePermissionKeys(req.user || {}, req.userRole);
        const hasAccess = normalizedRequired.every(
            (key) => hasPermission(userActions, key) || hasLegacyRoleAccess(req.userRole, key)
        );

        if (!hasAccess) {
            console.error(`[RBAC] Access Denied for User [${req.user?._id}] with role [${req.user?.role}]. Missing one of:`, normalizedRequired);
            console.error(`[RBAC] User Effective Permissions:`, userActions);
            return next(new AppError("You do not have required action permissions for this endpoint", 403));
        }

        next();
    };
};

/**
 * checkAnyActionAccess(actionKeys)
 * 
 * Grants access if the user has ANY of the specified action permissions.
 * Bypasses for 'admin' role.
 */
exports.checkAnyActionAccess = (...actionKeys) => {
    return (req, res, next) => {
        if (normalizeRole(req.user?.role) === "admin") return next();

        const normalizedRequired = actionKeys.map(normalizePermissionKey).filter(Boolean);
        const userActions = getEffectivePermissionKeys(req.user || {}, req.userRole);
        const hasAnyAccess = normalizedRequired.some(
            (key) => hasPermission(userActions, key) || hasLegacyRoleAccess(req.userRole, key)
        );

        if (!hasAnyAccess) {
            console.error(`[RBAC] Access Denied (Any) for User [${req.user?._id}] with role [${req.user?.role}]. Missing ALL of:`, normalizedRequired);
            console.error(`[RBAC] User Effective Permissions:`, userActions);
            return next(new AppError("You do not have required action permissions for this endpoint", 403));
        }

        next();
    };
};
