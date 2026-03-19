const { schedulerQueue, emailQueue } = require("./queues");
const logger = require("../utils/logger");
const VendorApplication = require("../models/VendorApplication");
const Vendor = require("../models/Vendor");
const Contract = require("../models/Contract");
const EmailService = require("../services/EmailService");
const NotificationService = require("../services/NotificationService");
const RiskEngine = require("../services/RiskEngine");
const AuditService = require("../services/AuditService");

class JobProcessor {
    static init() {
        logger.info("🎯 Job Processor Initialized");

        // Process Scheduler Tasks
        schedulerQueue.process(async (job) => {
            const { task } = job.data;
            logger.info(`Processing background task: ${task}`);

            switch (task) {
                case "CHECK_DOC_EXPIRY":
                    await this.checkDocumentExpiry();
                    break;
                case "CHECK_CONTRACT_EXPIRY":
                    await this.checkContractLifecycle();
                    break;
                case "CHECK_RISK_HEALTH":
                    await this.checkRiskHealth();
                    break;
                case "CHECK_PENDING_APPROVALS":
                    await this.checkPendingApprovals();
                    break;
                default:
                    logger.warn(`Unknown task: ${task}`);
            }
        });

        // Add recurring jobs if not already added
        this.setupRecurringJobs();
    }

    static async setupRecurringJobs() {
        // Daily tasks
        await schedulerQueue.add({ task: "CHECK_DOC_EXPIRY" }, { repeat: { cron: "0 0 * * *" } });
        await schedulerQueue.add({ task: "CHECK_CONTRACT_EXPIRY" }, { repeat: { cron: "0 0 * * *" } });

        // Weekly task (Sunday at midnight)
        await schedulerQueue.add({ task: "CHECK_RISK_HEALTH" }, { repeat: { cron: "0 0 * * 0" } });

        // Every 6 hours
        await schedulerQueue.add({ task: "CHECK_PENDING_APPROVALS" }, { repeat: { cron: "0 */6 * * *" } });
    }

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

                    await AuditService.log({
                        actionType: "SYSTEM_DOC_REMINDER_SENT",
                        entityType: "Application",
                        entityId: app._id,
                        afterData: { documentName: doc.name, daysLeft }
                    });

                    doc.reminderSent = true;
                    docUpdated = true;
                }
            }
            if (docUpdated) await app.save();
        }
    }

    static async checkContractLifecycle() {
        const today = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);

        const expiredContracts = await Contract.find({ endDate: { $lt: today }, status: "active" });
        for (const contract of expiredContracts) {
            contract.status = "expired";
            await contract.save();
            await AuditService.log({
                actionType: "SYSTEM_CONTRACT_EXPIRED",
                entityType: "Contract",
                entityId: contract._id,
                afterData: { status: "expired" }
            });
        }

        const expiringSoon = await Contract.find({
            endDate: { $lte: thirtyDaysLater, $gt: today },
            status: "active",
            renewalReminderSent: false
        }).populate({ path: "vendorId", model: "Vendor" });

        for (const contract of expiringSoon) {
            if (!contract.vendorId) continue;

            // Reusing logic from SchedulerService
            const content = `Your contract <strong>${contract.contractTitle} (#${contract.contractNumber})</strong> expires on ${contract.endDate.toLocaleDateString()}.`;
            await EmailService.sendEmail({
                to: contract.vendorId.email,
                subject: "Strategic Alert: Contract Renewal Required",
                html: EmailService.getBaseTemplate(content, `${process.env.FRONTEND_URL}/dashboard`, "Review Contract")
            });

            await AuditService.log({
                actionType: "SYSTEM_RENEWAL_REMINDER_SENT",
                entityType: "Contract",
                entityId: contract._id,
                afterData: { vendorEmail: contract.vendorId.email }
            });

            contract.renewalReminderSent = true;
            await contract.save();
        }
    }

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
            const currentStage = app.workflowStages.find(s => s.status === "pending");
            if (!currentStage) continue;

            await NotificationService.notifyAdminsByRole(currentStage.assignedRole, {
                title: "Urgent: Pending Review Reminder",
                message: `Application for ${app.companyName} has been idle in ${app.currentStage} for >48h.`,
                type: "WARNING",
                relatedEntityId: app._id,
                relatedEntityType: "Application"
            });

            await AuditService.log({
                actionType: "SYSTEM_REVIEW_REMINDER_SENT",
                entityType: "Application",
                entityId: app._id,
                afterData: { currentStage: app.currentStage }
            });

            app.lastReminderSentAt = new Date();
            await app.save();
        }
    }

    static async checkRiskHealth() {
        const vendors = await Vendor.find({ status: "approved" });
        for (const vendor of vendors) {
            await RiskEngine.recalculateRisk(vendor._id);
            await AuditService.log({
                actionType: "SYSTEM_RISK_RECALCULATED",
                entityType: "Vendor",
                entityId: vendor._id
            });
        }
    }
}

module.exports = JobProcessor;
