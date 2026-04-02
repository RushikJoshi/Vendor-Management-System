const AuditLog = require("../models/AuditLog");

/**
 * Logs a user action to the database
 */
exports.logAction = async ({
    user,
    action,
    module,
    targetId,
    previousValue,
    updatedValue,
    req,
}) => {
    try {
        await AuditLog.create({
            user: user || (req && req.user ? req.user.id : null),
            action,
            module,
            targetId,
            previousValue,
            updatedValue,
            ipAddress: req ? req.ip : "system",
            userAgent: req ? req.headers["user-agent"] : "system",
        });
    } catch (error) {
        console.error("❌ Audit logging failed:", error);
    }
};
