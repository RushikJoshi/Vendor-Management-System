const AuditLog = require("../models/AuditLog");

class AuditService {
    /**
     * Core logging function
     */
    static async log(params) {
        try {
            const {
                req,
                userId,
                userRole,
                actionType,
                entityType,
                entityId,
                beforeData,
                afterData,
                metadata = {}
            } = params;

            // Extract request-based info — safe for real req AND mock { user } objects
            const ipAddress = req?.headers?.['x-forwarded-for']
                || req?.socket?.remoteAddress
                || req?.connection?.remoteAddress
                || '127.0.0.1';
            const userAgent = req?.headers?.['user-agent'] || 'System Process';

            // Extract user info from req if not explicitly provided
            const finalUserId = userId || req?.user?._id || req?.user?.id || null;
            const finalUserRole = userRole || req?.user?.roleName || req?.user?.role || null;

            const auditEntry = new AuditLog({
                userId: finalUserId,
                userRole: finalUserRole,
                actionType,
                entityType,
                entityId,
                beforeData,
                afterData,
                metadata,
                ipAddress,
                userAgent
            });

            await auditEntry.save();
            return auditEntry;
        } catch (err) {
            console.error("🚨 Audit Logging Failed:", err.message);
            // We don't throw error to avoid breaking the main operation, 
            // but in a production environment, you might want to handle this more strictly.
        }
    }

    /**
     * Specialized logging helpers
     */

    static async logLogin(req, user, success = true) {
        return this.log({
            req,
            userId: user._id,
            userRole: user.roleName || 'Unknown',
            actionType: success ? "USER_LOGIN_SUCCESS" : "USER_LOGIN_FAILURE",
            entityType: "User",
            entityId: user._id,
            afterData: { email: user.email }
        });
    }

    static async logCreate(req, entityType, entity, metadata = {}) {
        return this.log({
            req,
            actionType: "RECORD_CREATED",
            entityType,
            entityId: entity._id,
            afterData: entity.toObject ? entity.toObject() : entity,
            metadata
        });
    }

    static async logUpdate(req, entityType, entityId, beforeData, afterData, metadata = {}) {
        return this.log({
            req,
            actionType: "RECORD_UPDATED",
            entityType,
            entityId,
            beforeData,
            afterData,
            metadata
        });
    }

    static async logStatusChange(req, entityType, entityId, oldStatus, newStatus, remarks = "") {
        return this.log({
            req,
            actionType: "STATUS_CHANGED",
            entityType,
            entityId,
            beforeData: { status: oldStatus },
            afterData: { status: newStatus },
            metadata: { remarks }
        });
    }

    static async logWorkflowAction(req, application, stageName, action, remarks = "") {
        return this.log({
            req,
            actionType: `WORKFLOW_${action}`,
            entityType: "Application",
            entityId: application._id,
            metadata: { stageName, remarks }
        });
    }
}

module.exports = AuditService;
