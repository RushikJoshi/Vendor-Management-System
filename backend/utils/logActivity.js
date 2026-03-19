const ActivityLog = require("../models/activityLog.model");

/**
 * Log activity for audit trail
 * @param {Object} options - { action, entityType, entityId, performedBy, oldData, newData, ipAddress }
 */
const logActivity = async (options) => {
    try {
        await ActivityLog.create({
            action: options.action,
            entityType: options.entityType,
            entityId: options.entityId,
            performedBy: options.performedBy,
            oldData: options.oldData,
            newData: options.newData,
            ipAddress: options.ipAddress,
        });
    } catch (error) {
        // We log the error to console but don't let it crash the main request
        console.error("ACTIVITY LOG ERROR:", error.message);
    }
};

module.exports = logActivity;
