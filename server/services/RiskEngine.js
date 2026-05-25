const Vendor = require("../models/Vendor");
const VendorApplication = require("../models/VendorApplication");
const Contract = require("../models/Contract");
const PerformanceReview = require("../models/PerformanceReview");
const NotificationService = require("./NotificationService");
const AuditService = require("./AuditService");

/**
 * 📊 Enterprise Vendor Risk Engine
 * Autonomous risk surveillance and multi-dimensional scoring
 */
class RiskEngine {
    /**
     * Orchestrates categorical and overall risk recalculation
     */
    static async recalculateRisk(vendorId) {
        try {
            const vendor = await Vendor.findById(vendorId);
            if (!vendor) return;

            // 1) Fetch linked application for historical and financial data
            const application = await VendorApplication.findOne({ email: vendor.email, status: "approved" });

            // 2) Fetch operational data
            const contracts = await Contract.find({ vendorId });
            const reviews = await PerformanceReview.find({ vendorId });

            // 3) Calculate Multi-Dimensional Scores
            const financialRisk = await this.calculateFinancialRisk(vendor, application, contracts);
            const complianceRisk = await this.calculateComplianceRisk(vendor, application);
            const operationalRisk = await this.calculateOperationalRisk(vendor, reviews, contracts);

            // 4) Weighted Aggregate Computation
            // Overall = 40% Financial + 35% Compliance + 25% Operational
            const overallRiskScore = Math.round(
                (0.40 * financialRisk) +
                (0.35 * complianceRisk) +
                (0.25 * operationalRisk)
            );

            // 5) Categorization Logic
            let riskLevel = "Low";
            if (overallRiskScore > 70) riskLevel = "High";
            else if (overallRiskScore > 30) riskLevel = "Medium";

            const oldLevel = vendor.riskLevel;

            // 6) Persistence Layer (Service-only update)
            vendor.financialRisk = financialRisk;
            vendor.complianceRisk = complianceRisk;
            vendor.operationalRisk = operationalRisk;
            vendor.overallRiskScore = overallRiskScore;
            vendor.riskLevel = riskLevel;
            vendor.riskLastCalculatedAt = new Date();
            await vendor.save();

            // 7) Event Escalation for Critical Risk
            if (riskLevel === "High" && oldLevel !== "High") {
                await this.triggerCriticalRiskAlert(vendor);
            }

            // 8) Forensic Logging
            await AuditService.log({
                actionType: "RISK_RECALCULATION",
                entityType: "Vendor",
                entityId: vendor._id,
                afterData: { overallRiskScore, riskLevel }
            });

            return vendor;
        } catch (err) {
            console.error("RiskEngine Execution Failure:", err);
            // Non-blocking failure for core business
        }
    }

    /**
     * Vector: Financial Sustainability (0-100)
     */
    static async calculateFinancialRisk(vendor, application, contracts) {
        let score = 50; // Neutral baseline

        if (application && application.scoreBreakdown) {
            const turnover = application.scoreBreakdown.turnover || 0;
            // logic: lower turnover relative to target increases risk
            if (turnover < 50) score += 40; // High risk
            else if (turnover < 80) score += 10; // Med risk
            else score -= 30; // Strong financial health
        }

        const totalContractValue = contracts.reduce((sum, c) => sum + (c.contractValue || 0), 0);
        if (totalContractValue > 1000000) score -= 10; // High value experience lowers risk

        return Math.min(100, Math.max(0, score));
    }

    /**
     * Vector: Regulatory & Compliance (0-100)
     */
    static async calculateComplianceRisk(vendor, application) {
        let score = 20; // Low baseline for approved vendors

        // Blacklist History Penalty
        if (vendor.blacklistHistory && vendor.blacklistHistory.length > 0) {
            score += 50; // Drastic increase for recidivism
        }

        // Expiry Governance
        if (application && application.documents) {
            const now = new Date();
            const expiredDocs = application.documents.filter(d => d.expiryDate && new Date(d.expiryDate) < now);
            if (expiredDocs.length > 0) {
                score += (expiredDocs.length * 15);
            }
        }

        if (vendor.lifecycleStatus === "suspended") score += 30;

        return Math.min(100, Math.max(0, score));
    }

    /**
     * Vector: Operational Continuity (0-100)
     */
    static async calculateOperationalRisk(vendor, reviews, contracts) {
        let score = 40; // baseline

        // Performance Analytics
        if (reviews.length > 0) {
            const avgRating = reviews.reduce((sum, r) => sum + r.overallScore, 0) / reviews.length;
            if (avgRating < 50) score += 40;
            else if (avgRating < 75) score += 10;
            else score -= 20;
        } else if (vendor.rating > 0) {
            // Fallback to pre-calculated rating (0-5 scale)
            if (vendor.rating < 2.5) score += 30;
        }

        // Pipeline Health
        const activeContracts = contracts.filter(c => c.status === "active").length;
        if (activeContracts === 0) score += 20; // Lack of active engagement increases continuity risk

        return Math.min(100, Math.max(0, score));
    }

    /**
     * Internal: Escalates critical risk transitions to management
     */
    static async triggerCriticalRiskAlert(vendor) {
        await NotificationService.notifyAdminsByRole("Procurement Manager", {
            title: "CRITICAL RISK ALERT: " + vendor.companyName,
            message: `Vendor risk level has escalated to HIGH (Score: ${vendor.overallRiskScore}). Immediate review required.`,
            type: "ERROR",
            relatedEntityId: vendor._id,
            relatedEntityType: "Vendor"
        });

        // Trigger in-app notification for vendor (Transparency)
        await NotificationService.notify({
            userId: vendor._id,
            userModel: "Vendor",
            title: "Risk Profile Update",
            message: "Your risk level has been updated based on recent compliance/performance data. Please review your dashboard.",
            type: "WARNING",
            relatedEntityId: vendor._id,
            relatedEntityType: "Vendor"
        });
    }
}

module.exports = RiskEngine;
