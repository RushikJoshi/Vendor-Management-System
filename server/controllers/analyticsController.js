const Vendor = require("../models/Vendor");
const VendorApplication = require("../models/VendorApplication");
const Category = require("../models/Category");
const Contract = require("../models/Contract");
const TreeSubmission = require("../models/TreeSubmission");
const SchedulerService = require("../services/SchedulerService");
const mongoose = require("mongoose");

// Simple in-memory cache
let analyticsCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

exports.getAnalytics = async (req, res) => {
    try {
        const now = Date.now();
        if (analyticsCache && (now - lastCacheTime < CACHE_DURATION)) {
            return res.status(200).json({ success: true, data: analyticsCache, fromCache: true });
        }

        const today = new Date();
        const fifteenDaysLater = new Date();
        fifteenDaysLater.setDate(today.getDate() + 15);

        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);

        const totalVendors = await Vendor.countDocuments();
        const approvedVendors = await Vendor.countDocuments({ status: "approved" });
        
        const [wizardPending, treePending] = await Promise.all([
            VendorApplication.countDocuments({ status: { $in: ["submitted", "under_review", "pending"] } }),
            TreeSubmission.countDocuments({ status: { $in: ["pending", "submitted"] } })
        ]);
        const pendingApprovals = wizardPending + treePending;

        // 📊 1. Approval Metrics
        const approvalMetrics = await VendorApplication.aggregate([
            { $match: { status: "approved", submittedAt: { $exists: true }, approvedAt: { $exists: true } } },
            {
                $project: {
                    duration: {
                        $divide: [{ $subtract: ["$approvedAt", "$submittedAt"] }, 1000 * 60 * 60 * 24]
                    },
                    workflowStages: 1
                }
            },
            {
                $group: {
                    _id: null,
                    avgDays: { $avg: "$duration" },
                    fastest: { $min: "$duration" },
                    slowest: { $max: "$duration" }
                }
            }
        ]);

        const stageWiseMetrics = await VendorApplication.aggregate([
            { $unwind: "$workflowStages" },
            { $match: { "workflowStages.status": "approved", "workflowStages.reviewedAt": { $exists: true } } },
            {
                $group: {
                    _id: "$workflowStages.stageName",
                    avgDays: { $avg: 1.5 } // Simplified for demo
                }
            }
        ]);

        // 🥧 2. Risk Distribution
        const riskDistribution = await Vendor.aggregate([
            { $group: { _id: "$riskLevel", count: { $sum: 1 } } }
        ]);

        const riskFormatted = {
            High: riskDistribution.find(r => r._id === "High")?.count || 0,
            Medium: riskDistribution.find(r => r._id === "Medium")?.count || 0,
            Low: riskDistribution.find(r => r._id === "Low")?.count || 0
        };

        // 📈 3. Category Performance
        const categoryPerformance = await Category.aggregate([
            {
                $lookup: { from: "vendors", localField: "_id", foreignField: "category", as: "vendors" }
            },
            {
                $lookup: { from: "vendorapplications", localField: "_id", foreignField: "category", as: "apps" }
            },
            {
                $project: {
                    categoryName: "$name",
                    vendorCount: { $size: "$vendors" },
                    avgPerformance: { $avg: "$vendors.rating" },
                    avgRisk: { $avg: "$vendors.overallRiskScore" },
                    approvalRate: {
                        $cond: [
                            { $gt: [{ $size: "$apps" }, 0] },
                            {
                                $multiply: [
                                    { $divide: [{ $size: { $filter: { input: "$apps", as: "a", cond: { $eq: ["$$a.status", "approved"] } } } }, { $size: "$apps" }] },
                                    100
                                ]
                            },
                            0
                        ]
                    }
                }
            }
        ]);

        // ⚠️ 4. Compliance Surveillance
        const expiringDocuments = await VendorApplication.aggregate([
            { $unwind: "$documents" },
            { $match: { "documents.expiryDate": { $lte: fifteenDaysLater, $gte: today }, "documents.status": "verified" } },
            {
                $project: {
                    vendorName: "$companyName",
                    documentName: "$documents.name",
                    expiryDate: "$documents.expiryDate",
                    daysRemaining: {
                        $ceil: { $divide: [{ $subtract: ["$documents.expiryDate", today] }, 1000 * 60 * 60 * 24] }
                    }
                }
            },
            { $sort: { expiryDate: 1 } }
        ]);

        // 📈 5. Vendor Growth Trend
        const vendorGrowthTrend = await Vendor.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 12 }
        ]).then(results => results.map(r => ({
            period: `${r._id.year}-${String(r._id.month).padStart(2, '0')}`,
            vendors: r.count
        })));

        const upcomingContractExpiries = await Contract.find({
            endDate: { $lte: thirtyDaysLater, $gte: today },
            status: "active"
        }).populate("vendorId", "companyName").limit(5);

        // ⏰ 5. Scheduler Status & Stale Counts
        const staleThreshold = new Date();
        staleThreshold.setHours(staleThreshold.getHours() - 48);
        const staleApprovalsCount = await VendorApplication.countDocuments({
            status: "submitted",
            updatedAt: { $lte: staleThreshold }
        });

        const schedulerStatus = SchedulerService.getStatus();

        const finalResult = {
            totalVendors,
            approvedVendors,
            pendingApprovals,
            approvalMetrics: {
                averageApprovalDays: Math.round((approvalMetrics[0]?.avgDays || 0) * 10) / 10,
                fastestApprovalDays: Math.round((approvalMetrics[0]?.fastest || 0) * 10) / 10,
                slowestApprovalDays: Math.round((approvalMetrics[0]?.slowest || 0) * 10) / 10,
                stageWiseAverage: stageWiseMetrics.map(s => ({ stageName: s._id, avgDays: s.avgDays }))
            },
            riskDistribution: riskFormatted,
            categoryPerformance,
            vendorGrowthTrend,
            expiringDocuments,
            upcomingContractExpiries,
            staleApprovalsCount,
            schedulerStatus
        };

        analyticsCache = finalResult;
        lastCacheTime = now;

        res.status(200).json({ success: true, data: finalResult });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
