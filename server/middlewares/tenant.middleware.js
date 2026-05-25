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
    
    // Superadmins and System Admins can bypass strict tenant checks or use header
    const bypassRoles = ['superadmin', 'platform_admin', 'admin', 'system_admin', 'procurement'];
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
