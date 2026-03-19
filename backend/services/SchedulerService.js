const cron = require("node-cron");
const VendorApplication = require("../models/VendorApplication");
const Vendor = require("../models/Vendor");
const EmailService = require("./EmailService");
const NotificationService = require("./NotificationService");
const AuditService = require("./AuditService");
const Contract = require("../models/Contract");
const RiskEngine = require("./RiskEngine");

/**
 * ⏰ Enterprise Background Scheduler
 * Centralized automation for compliance, lifecycles, and approvals
 */
class SchedulerService {
    static lastRunAt = null;

    static init() {
        console.log("🚀 Enterprise Background Scheduler Initialized");

        // 1. Daily at Midnight (00:00) - Compliance Expiry Surveillance
        cron.schedule("0 0 * * *", async () => {
            console.log("🔍 [Cron] Executing Daily Compliance Audit...");
            await this.runJob("Document Expiry", () => this.checkDocumentExpiry());
            await this.runJob("Contract Expiry", () => this.checkContractLifecycle());
            await this.runJob("Risk Health Scan", () => this.checkRiskHealth());
            this.lastRunAt = new Date();
        });

        // 2. Every 6 Hours - Approval Velocity Watchdog
        cron.schedule("0 */6 * * *", async () => {
            console.log("🔍 [Cron] Executing Approval Velocity Scan...");
            await this.runJob("Pending Approvals", () => this.checkPendingApprovals());
        });
    }

    /**
     * Internal: Job Wrapper with Error Isolation and Tracking
     */
    static async runJob(name, jobFn) {
        try {
            await jobFn();
        } catch (err) {
            console.error(`❌ Scheduler Failure [${name}]:`, err.message);
            // Non-blocking error logging
            await AuditService.log({
                actionType: "SCHEDULER_JOB_FAILURE",
                entityType: "System",
                metadata: { jobName: name, error: err.message }
            });
        }
    }

    /**
     * Logic: Proactive Document Expiry Notifications (T-7 Days)
     */
    static async checkDocumentExpiry() {
        const today = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(today.getDate() + 7);

        const apps = await VendorApplication.find({
            "documents": {
                $elemMatch: {
                    expiryDate: { $lte: sevenDaysLater, $gt: today },
                    status: "verified",
                    reminderSent: false
                }
            }
        });

        for (const app of apps) {
            let docUpdated = false;
            for (const doc of app.documents) {
                if (doc.expiryDate <= sevenDaysLater && doc.expiryDate > today && doc.status === "verified" && !doc.reminderSent) {
                    const daysLeft = Math.ceil((doc.expiryDate - today) / (1000 * 60 * 60 * 24));

                    await EmailService.sendDocumentExpiryAlert(app.email, doc.name, daysLeft);
                    await NotificationService.notify({
                        userId: app._id,
                        userModel: "Vendor",
                        title: "Action Required: Document Expiring",
                        message: `Compliance document ${doc.name} expires in ${daysLeft} days. Renewal required.`,
                        type: "EXPIRY",
                        relatedEntityId: app._id,
                        relatedEntityType: "Application"
                    });

                    doc.reminderSent = true;
                    docUpdated = true;

                    await AuditService.log({
                        actionType: "EXPIRY_REMINDER_DISPATCHED",
                        entityType: "Document",
                        entityId: doc._id,
                        metadata: { docName: doc.name, vendorMatch: app.companyName }
                    });
                }
            }
            if (docUpdated) await app.save();
        }
    }

    /**
     * Logic: Contract Lifecycle & Renewal Reminders (T-30 Days)
     */
    static async checkContractLifecycle() {
        const today = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);

        // 1. Terminal State: Contract Expiry
        const expired = await Contract.updateMany(
            { endDate: { $lt: today }, status: "active" },
            { status: "expired" }
        );

        if (expired.modifiedCount > 0) {
            console.log(`✅ [Cron] Deactivated ${expired.modifiedCount} expired contracts`);
        }

        // 2. Renewal Reminders
        const expiringSoon = await Contract.find({
            endDate: { $lte: thirtyDaysLater, $gt: today },
            status: "active",
            renewalReminderSent: false
        }).populate({ path: "vendorId", model: "Vendor" });

        for (const contract of expiringSoon) {
            if (!contract.vendorId) continue;

            const content = `Your contract <strong>${contract.contractTitle} (#${contract.contractNumber})</strong> expires on ${contract.endDate.toLocaleDateString()}.`;
            await EmailService.sendEmail({
                to: contract.vendorId.email,
                subject: "Strategic Alert: Contract Renewal Required",
                html: EmailService.getBaseTemplate(content, `${process.env.FRONTEND_URL}/dashboard`, "Review Contract")
            });

            await NotificationService.notifyAdminsByRole("Procurement Manager", {
                title: "Upcoming Contract Expiry",
                message: `${contract.vendorId.companyName} contract #${contract.contractNumber} expires in 30 days.`,
                type: "WARNING",
                relatedEntityId: contract._id,
                relatedEntityType: "Contract"
            });

            contract.renewalReminderSent = true;
            await contract.save();

            await AuditService.log({
                actionType: "CONTRACT_RENEWAL_ALERT",
                entityType: "Contract",
                entityId: contract._id,
                metadata: { vendor: contract.vendorId.companyName }
            });

            // Cascade: Refresh Risk Score
            await RiskEngine.recalculateRisk(contract.vendorId._id);
        }
    }

    /**
     * Logic: Approval Velocity Watchdog (Stale Review Reminders)
     */
    static async checkPendingApprovals() {
        const staleThreshold = new Date();
        staleThreshold.setHours(staleThreshold.getHours() - 48);

        const staleApps = await VendorApplication.find({
            status: "submitted",
            updatedAt: { $lte: staleThreshold },
            $or: [
                { lastReminderSentAt: { $exists: false } },
                { lastReminderSentAt: { $lte: staleThreshold } }
            ]
        });

        for (const app of staleApps) {
            // Identified current stage requirement
            const currentStage = app.workflowStages.find(s => s.status === "pending");
            if (!currentStage) continue;

            await NotificationService.notifyAdminsByRole(currentStage.assignedRole, {
                title: "Urgent: Pending Review Reminder",
                message: `Application for ${app.companyName} has been idle in ${app.currentStage} for >48h.`,
                type: "WARNING",
                relatedEntityId: app._id,
                relatedEntityType: "Application"
            });

            app.lastReminderSentAt = new Date();
            await app.save();

            await AuditService.log({
                actionType: "APPROVAL_REMINDER_SENT",
                entityType: "Application",
                entityId: app._id,
                metadata: { stage: app.currentStage, assignee: currentStage.assignedRole }
            });
        }
    }

    /**
     * Logic: Global Risk Posture Refresh
     */
    static async checkRiskHealth() {
        const vendors = await Vendor.find({ status: "approved" });
        for (const vendor of vendors) {
            await RiskEngine.recalculateRisk(vendor._id);
        }
    }

    static getStatus() {
        return {
            isRunning: true,
            lastRunAt: this.lastRunAt,
            environment: process.env.NODE_ENV
        };
    }
}

module.exports = SchedulerService;
