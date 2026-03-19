const WorkflowEngine = require("./WorkflowEngine");
const EmailService = require("./EmailService");
const NotificationService = require("./NotificationService");

/**
 * 🏢 Vendor Onboarding Workflow Implementation
 * High-level orchestration for vendor dossiers
 */
class WorkflowService {
    /**
     * WORKFLOW CONFIGURATION FOR VENDOR ONBOARDING
     */
    static CONFIG = {
        stages: [
            { order: 1, name: "TECHNICAL", role: "Technical Reviewer", permission: "APPLICATION_APPROVE_TECHNICAL" },
            { order: 2, name: "FINANCE", role: "Finance Reviewer", permission: "APPLICATION_APPROVE_FINANCE" },
            { order: 3, name: "COMPLIANCE", role: "Compliance Officer", permission: "APPLICATION_APPROVE_COMPLIANCE" },
            { order: 4, name: "FINAL_APPROVAL", role: "Procurement Manager", permission: "APPLICATION_APPROVE_FINAL" }
        ]
    };

    /**
     * Initializes the workflow stages for a new application
     */
    static initializeWorkflow(application) {
        return WorkflowEngine.initialize(application, this.CONFIG);
    }

    /**
     * Processes approval for a stage
     */
    static async approveStage(application, user, remarks, req) {
        const { stage, isCompleted } = await WorkflowEngine.approveStage({
            entity: application,
            user,
            remarks,
            entityType: "Application",
            req   // real Express req for audit logging
        });

        if (isCompleted) {
            application.approvedAt = new Date();
        }

        await application.save({ validateBeforeSave: false });

        // Non-critical communications — don't let failures kill the approval
        try {
            await EmailService.sendApprovalNotification(application.email, application.companyName, stage.stageName);
        } catch (e) { console.error("Approval email failed:", e.message); }

        try {
            await NotificationService.notify({
                userId: application._id,
                userModel: "Vendor",
                title: `Stage Approved: ${stage.stageName}`,
                message: `Your ${stage.stageName} stage has been authorized.`,
                type: "SUCCESS",
                relatedEntityId: application._id,
                relatedEntityType: "Application"
            });
        } catch (e) { console.error("Notification failed:", e.message); }

        if (isCompleted) {
            try {
                await NotificationService.notifyAdminsByRole("Procurement Manager", {
                    title: "Vendor Onboarding Finalized",
                    message: `${application.companyName} has completed all compliance stages.`,
                    type: "SUCCESS",
                    relatedEntityId: application._id,
                    relatedEntityType: "Application"
                });
            } catch (e) { console.error("Admin notification failed:", e.message); }
        }

        return application;
    }

    /**
     * Processes rejection and terminates workflow
     */
    static async rejectStage(application, user, remarks, req) {
        const { stage } = await WorkflowEngine.rejectStage({
            entity: application,
            user,
            remarks,
            entityType: "Application",
            req
        });

        await application.save({ validateBeforeSave: false });

        try {
            await EmailService.sendRejectionNotification(application.email, application.companyName, stage.stageName, remarks);
        } catch (e) { console.error("Rejection email failed:", e.message); }

        try {
            await NotificationService.notify({
                userId: application._id,
                userModel: "Vendor",
                title: `Application Rejected: ${stage.stageName}`,
                message: `Your application failed during ${stage.stageName}. Reason: ${remarks}`,
                type: "ERROR",
                relatedEntityId: application._id,
                relatedEntityType: "Application"
            });
        } catch (e) { console.error("Notification failed:", e.message); }

        return application;
    }

    /**
     * Processes clarification request
     */
    static async requestChanges(application, user, remarks, req) {
        await WorkflowEngine.requestChanges({
            entity: application,
            user,
            remarks,
            entityType: "Application",
            req
        });

        await application.save({ validateBeforeSave: false });
        return application;
    }
}

module.exports = WorkflowService;
