const Company = require("../models/Company");
const AppError = require("../utils/AppError");

const PLAN_LIMITS = {
    free: { maxVendors: 5, maxRFQs: 2 },
    pro: { maxVendors: 100, maxRFQs: 50 },
    enterprise: { maxVendors: Infinity, maxRFQs: Infinity }
};

exports.checkLimit = (resource) => {
    return async (req, res, next) => {
        // Admins can bypass limits if not associated with a specific tenant
        if (req.user.role === 'admin' && !req.user.tenantId) return next();

        const company = await Company.findById(req.user.tenantId);
        if (!company) return next(new AppError("Company not found for usage check", 404));


        const plan = company.subscription?.plan || "free";
        const limit = PLAN_LIMITS[plan][resource];
        const currentUsage = company.usage?.[resource] || 0;

        if (currentUsage >= limit) {
            return next(new AppError(`You have reached the limit for ${resource} on the ${plan} plan. Please upgrade.`, 403));
        }

        next();
    };
};
