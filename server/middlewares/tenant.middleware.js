const AppError = require("../utils/AppError");

/**
 * Middleware to ensure tenant isolation
 * Prevents access if tenantId is missing or mismatched
 */
exports.restrictToTenant = (req, res, next) => {
    if (!req.user) {
        console.error("Critical Security Failure: Request reached tenant isolation without user context.");
        return next(new AppError("Identification failed. Please login.", 401));
    }

    const role = req.user?.role?.toLowerCase();
    
    // Only platform-level roles may choose tenant context explicitly.
    // Company admins and procurement users must remain scoped to their own tenant.
    const bypassRoles = ['superadmin', 'platform_admin', 'system_admin'];
    if (bypassRoles.includes(role)) {
        req.tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return next();
    }

    if (!req.user.tenantId) {
        return next(new AppError("Access Denied: Your account is not associated with a registered company.", 403));
    }
    
    req.tenantId = req.user.tenantId;
    next();
};
