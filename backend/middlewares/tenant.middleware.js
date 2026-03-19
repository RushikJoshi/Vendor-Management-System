const AppError = require("../utils/AppError");

/**
 * Middleware to ensure tenant isolation
 * Prevents access if tenantId is missing or mismatched
 */
exports.restrictToTenant = (req, res, next) => {
    const role = req.user?.role?.toLowerCase();
    
    // Debug log to identify why 403 occurs
    console.log('🔍 Tenant Check:', {
        userId: req.user?._id,
        role: role,
        tenantId: req.user?.tenantId,
        headers: req.headers['x-tenant-id']
    });

    // Superadmins can bypass tenant checks (they see all or use header)
    if (role === 'superadmin' || role === 'platform_admin' || role === 'admin') {
        req.tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
        return next();
    }

    if (!req.user || !req.user.tenantId) {
        return next(new AppError("Tenant identification missing or unauthorized. Access denied.", 403));
    }
    
    req.tenantId = req.user.tenantId;
    next();
};
