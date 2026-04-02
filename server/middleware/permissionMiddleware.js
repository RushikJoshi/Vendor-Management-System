const { normalizeRole, ROLE_HIERARCHY } = require("../config/roles");

/**
 * Permission matrix — maps granular permissions to minimum required role level
 * Higher level roles automatically inherit lower level permissions
 */
const PERMISSION_LEVELS = {
    // Application permissions
    "APPLICATION_VIEW_BASIC": ROLE_HIERARCHY["hr"],    // 3+
    "APPLICATION_APPROVE_BASIC": ROLE_HIERARCHY["hr"], // 3+
    "APPLICATION_APPROVE_FINAL": ROLE_HIERARCHY["admin"], // 4+

    // Vendor permissions
    "VENDOR_VIEW": ROLE_HIERARCHY["hr"],    // 3+
    "VENDOR_MANAGE": ROLE_HIERARCHY["admin"], // 4+
    "MANAGE_VENDORS": ROLE_HIERARCHY["hr"], // 3+

    // Contract permissions
    "CONTRACT_VIEW": ROLE_HIERARCHY["manager"], // 2+
    "CONTRACT_MANAGE": ROLE_HIERARCHY["manager"], // 2+
    "MANAGE_CONTRACTS": ROLE_HIERARCHY["manager"], // 2+

    // Audit permissions
    "AUDIT_VIEW": ROLE_HIERARCHY["admin"], // 4+

    // Settings
    "SETTINGS_MANAGE": ROLE_HIERARCHY["admin"], // 4+

    // Catch-all
    "DEFAULT": ROLE_HIERARCHY["admin"],
};


/**
 * checkPermission(requiredPermission)
 * 
 * Grants access if the user's role level >= the minimum level required for the permission.
 * Superadmin and admins bypass all checks via role level.
 * 
 * If called without argument → defaults to requiring "admin" level.
 */
exports.checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: "Not authorized." });
            }

            const roleName = req.user.roleName || req.user.role || "vendor";
            const normalizedRole = normalizeRole(roleName);
            const userLevel = ROLE_HIERARCHY[normalizedRole] ?? -1;

            // Superadmin always passes
            if (userLevel >= ROLE_HIERARCHY["superadmin"]) return next();

            // If no specific permission required, just need to be logged in admin
            if (!requiredPermission) {
                if (userLevel >= ROLE_HIERARCHY["compliance"]) return next();
                return res.status(403).json({ success: false, message: "Access denied. Admin access required." });
            }

            // Check against permission matrix
            const requiredLevel = PERMISSION_LEVELS[requiredPermission] ?? PERMISSION_LEVELS["DEFAULT"];
            if (userLevel >= requiredLevel) return next();

            // Log unauthorized attempt
            try {
                const AuditService = require("../services/AuditService");
                AuditService.log({
                    req,
                    actionType: "UNAUTHORIZED_ACCESS_ATTEMPT",
                    entityType: "System",
                    metadata: { requiredPermission, userRole: normalizedRole, userLevel, requiredLevel }
                }).catch(() => { });
            } catch { /* non-critical */ }

            return res.status(403).json({
                success: false,
                message: `Access denied. Insufficient role level for this action.`
            });

        } catch (err) {
            next(err);
        }
    };
};
