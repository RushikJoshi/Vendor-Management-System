const AuditService = require("./AuditService");

/**
 * 🚀 Enterprise Workflow Engine
 * Centralized logic for multi-stage approval processes
 */
class WorkflowEngine {
    /**
     * WORKFLOW STATE MACHINE MAP
     */
    static STATUS = {
        LOCKED: "locked",
        PENDING: "pending",
        APPROVED: "approved",
        REJECTED: "rejected",
        CHANGES_REQUESTED: "changes_requested"
    };

    /**
     * Initializes workflow stages for any entity based on a config
     */
    static initialize(entity, config) {
        if (!config || !config.stages) throw new Error("Workflow config missing stages");

        entity.workflowStages = config.stages.map(s => ({
            stageOrder: s.order,
            stageName: s.name,
            assignedRole: s.role,
            permission: s.permission,
            status: s.order === 1 ? this.STATUS.PENDING : this.STATUS.LOCKED
        }));

        // Always set currentStage to a valid enum string, never a number
        const validStages = ["TECHNICAL", "FINANCE", "COMPLIANCE", "FINAL_APPROVAL", "COMPLETED"];
        const firstStageName = config.stages[0].name;
        entity.currentStage = validStages.includes(firstStageName) ? firstStageName : "TECHNICAL";
        return entity;
    }

    /**
     * Internal: Validate if a user has authority to process the current stage
     */
    static validateAccess(entity, user) {
        const { normalizeRole, ROLE_HIERARCHY } = require("../config/roles");

        const stage = entity.workflowStages?.find(s => s.stageName === entity.currentStage);

        if (!stage) {
            // Self-heal: reset to TECHNICAL if stage is missing/invalid
            const firstStage = entity.workflowStages?.[0];
            if (firstStage) {
                firstStage.status = this.STATUS.PENDING;
                entity.currentStage = firstStage.stageName;
                return firstStage;
            }
            const err = new Error("Invalid workflow state: No stages found. Please re-initialize the application.");
            err.code = "STAGE_NOT_FOUND";
            err.statusCode = 400;
            throw err;
        }

        if (stage.status !== this.STATUS.PENDING) {
            const err = new Error(`Stage '${stage.stageName}' is already '${stage.status}'. It cannot be acted on again.`);
            err.code = "INVALID_STAGE_STATUS";
            err.statusCode = 400;
            throw err;
        }

        // Hierarchy-based access: any role at compliance(1) level or above can act
        const userRole = normalizeRole(user.roleName || user.role || "vendor");
        const userLevel = ROLE_HIERARCHY[userRole] ?? -1;
        const MIN_LEVEL_TO_APPROVE = ROLE_HIERARCHY["compliance"]; // level 1

        if (userLevel < MIN_LEVEL_TO_APPROVE) {
            const err = new Error(`Access denied: role '${userRole}' cannot approve workflow stages.`);
            err.code = "INSUFFICIENT_PERMISSIONS";
            err.statusCode = 403;
            throw err;
        }

        return stage;
    }

    /**
     * High-level: Approve a stage and unlock the next
     */
    static async approveStage({ entity, user, remarks, entityType, req }) {
        const stage = this.validateAccess(entity, user);

        const beforeData = { stage: stage.stageName, status: stage.status };

        stage.status = this.STATUS.APPROVED;
        stage.reviewedBy = user.id || user._id;
        stage.reviewedAt = new Date();
        stage.remarks = remarks;

        const nextStage = entity.workflowStages.find(s => s.stageOrder === stage.stageOrder + 1);

        if (nextStage) {
            nextStage.status = this.STATUS.PENDING;
            entity.currentStage = nextStage.stageName;
        } else {
            entity.currentStage = "COMPLETED";
            entity.status = "approved";
        }

        await AuditService.log({
            req,
            actionType: `WORKFLOW_STAGE_APPROVED`,
            entityType: entityType || "General",
            entityId: entity._id,
            beforeData,
            afterData: { stage: stage.stageName, status: stage.status, nextStage: entity.currentStage },
            metadata: { remarks }
        });

        return { entity, stage, nextStage, isCompleted: !nextStage };
    }

    /**
     * High-level: Reject a stage and terminate workflow
     */
    static async rejectStage({ entity, user, remarks, entityType, req }) {
        const stage = this.validateAccess(entity, user);

        const beforeData = { stage: stage.stageName, status: stage.status };

        stage.status = this.STATUS.REJECTED;
        stage.reviewedBy = user.id || user._id;
        stage.reviewedAt = new Date();
        stage.remarks = remarks;

        entity.status = "rejected";

        entity.workflowStages.forEach(s => {
            if (s.status === this.STATUS.PENDING || s.status === this.STATUS.LOCKED) {
                s.status = this.STATUS.LOCKED;
            }
        });

        await AuditService.log({
            req,
            actionType: `WORKFLOW_STAGE_REJECTED`,
            entityType: entityType || "General",
            entityId: entity._id,
            beforeData,
            afterData: { stage: stage.stageName, status: stage.status },
            metadata: { remarks }
        });

        return { entity, stage, isCompleted: true };
    }

    /**
     * High-level: Request changes (doesn't move stage)
     */
    static async requestChanges({ entity, user, remarks, entityType, req }) {
        const stage = this.validateAccess(entity, user);

        entity.status = "changes_requested";
        stage.remarks = remarks;

        await AuditService.log({
            req,
            actionType: `WORKFLOW_CHANGES_REQUESTED`,
            entityType: entityType || "General",
            entityId: entity._id,
            metadata: { remarks }
        });

        return { entity, stage };
    }

    /**
     * Explicit Termination (for manual/administrative stop)
     */
    static async terminateWorkflow(entity, user, remarks) {
        entity.status = "terminated";
        entity.workflowStages.forEach(s => s.status = this.STATUS.LOCKED);
        return entity;
    }

    /**
     * Retrieves current descriptive status
     */
    static getWorkflowStatus(entity) {
        const current = entity.workflowStages.find(s => s.stageName === entity.currentStage);
        return {
            currentStage: entity.currentStage,
            status: entity.status,
            stageDetail: current
        };
    }
}

module.exports = WorkflowEngine;
