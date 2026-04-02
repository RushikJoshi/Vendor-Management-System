const Vendor = require("../models/Vendor");
const AuditService = require("./AuditService");
const NotificationService = require("./NotificationService");
const PerformanceReview = require("../models/PerformanceReview");
const RiskEngine = require("./RiskEngine");

class LifecycleService {
    /**
     * Strict Lifecycle State Machine Transitions
     */
    static ALLOWED_TRANSITIONS = {
        'pending': ['active'],
        'active': ['suspended', 'inactive', 'blacklisted'],
        'suspended': ['active'],
        'blacklisted': ['inactive'] // Manual review required to even get to inactive
    };

    /**
     * Updates vendor lifecycle status with strict transition rules
     */
    static async transitionStatus(req, vendorId, newStatus, reason = "", remarks = "") {
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) throw new Error("Vendor not found");

        const currentStatus = vendor.lifecycleStatus || 'active'; // Default to active if not set

        // Validation for special transition from pending (registration) to active (lifecycle)
        // Note: vendor.status is the onboarding status (pending/approved)
        // lifecycleStatus only applies once approved

        const allowed = this.ALLOWED_TRANSITIONS[currentStatus] || [];
        if (!allowed.includes(newStatus)) {
            throw new Error(`Invalid lifecycle transition: ${currentStatus} -> ${newStatus}`);
        }

        const beforeData = { lifecycleStatus: vendor.lifecycleStatus };

        // Handle Blacklisting specific logic
        if (newStatus === 'blacklisted') {
            if (!reason) throw new Error("Reason is mandatory for blacklisting");
            vendor.blacklistHistory.push({
                reason,
                blacklistedBy: req.user.id,
                remarks
            });
        }

        vendor.lifecycleStatus = newStatus;
        await vendor.save();

        // Audit Log
        await AuditService.log({
            req,
            actionType: "LIFECYCLE_STATUS_CHANGED",
            entityType: "Vendor",
            entityId: vendor._id,
            beforeData,
            afterData: { lifecycleStatus: newStatus },
            metadata: { reason, remarks }
        });

        // In-App Notification
        await NotificationService.notify({
            userId: vendor._id,
            userModel: "Vendor",
            title: "Account Status Update",
            message: `Your account lifecycle status has been updated to: ${newStatus.toUpperCase()}`,
            type: newStatus === 'blacklisted' ? "ERROR" : "WARNING",
            relatedEntityId: vendor._id,
            relatedEntityType: "Vendor"
        });

        // Recalculate Risk Profile
        await RiskEngine.recalculateRisk(vendor._id);

        return vendor;
    }

    /**
     * Records performance review and updates vendor average rating
     */
    static async recordPerformance(req, vendorId, scores, remarks = "") {
        const { quality, delivery, compliance, communication } = scores;

        // weighting: 30, 30, 20, 20
        const overallScore = Math.round(
            (quality * 0.3) + (delivery * 0.3) + (compliance * 0.2) + (communication * 0.2)
        );

        const review = await PerformanceReview.create({
            vendorId,
            reviewerId: req.user.id,
            qualityScore: quality,
            deliveryScore: delivery,
            complianceScore: compliance,
            communicationScore: communication,
            overallScore,
            remarks
        });

        // Update Vendor average
        const allReviews = await PerformanceReview.find({ vendorId });
        const avgRating = allReviews.reduce((acc, r) => acc + r.overallScore, 0) / allReviews.length;

        await Vendor.findByIdAndUpdate(vendorId, { averageRating: Math.round(avgRating) });

        // Audit Log
        await AuditService.logCreate(req, "PerformanceReview", review);

        // Alert if performance is low
        if (overallScore < 50) {
            await NotificationService.notifyAdminsByRole("Procurement Manager", {
                title: "Low Vendor Performance Alert",
                message: `Vendor performance for ${vendorId} dropped to ${overallScore}%`,
                type: "ERROR",
                relatedEntityId: vendorId,
                relatedEntityType: "Vendor"
            });
        }

        // Recalculate Risk Profile
        await RiskEngine.recalculateRisk(vendorId);

        return review;
    }
}

module.exports = LifecycleService;
