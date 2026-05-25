const Vendor = require("../models/vendor.model");
const VendorApplication = require("../models/VendorApplication");
const TreeSubmission = require("../models/TreeSubmission");
const Category = require("../models/Category");
const PurchaseOrder = require("../models/PurchaseOrder");
const RFQ = require("../models/RFQ");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Get Vendor Dashboard Statistics
 * @route   GET /api/v1/dashboard/vendor-stats
 * @access  Private/Admin
 */
exports.getVendorStats = asyncHandler(async (req, res, next) => {
    // 1) General Statistics
    const statsQuery = Vendor.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        {
            $group: {
                _id: null,
                totalVendors: { $sum: 1 },
                activeVendors: {
                    $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
                },
                averageRating: { $avg: "$rating" }
            }
        },
        {
            $project: {
                _id: 0,
                totalVendors: 1,
                activeVendors: 1,
                averageRating: { $round: ["$averageRating", 1] }
            }
        }
    ]);

    // 1.1) Financial Statistics from Purchase Orders
    const financialQuery = PurchaseOrder.aggregate([
        { $match: { status: { $nin: ["cancelled", "rejected"] } } },
        {
            $group: {
                _id: null,
                totalSpend: { $sum: "$totalAmount" },
                totalOrders: { $sum: 1 }
            }
        }
    ]);

    // 2) Monthly Growth Statistics (Last 12 Months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1); 

    const monthlyQuery = Vendor.aggregate([
        {
            $match: {
                isDeleted: { $ne: true },
                createdAt: { $gte: twelveMonthsAgo }
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 3) Category Mix
    const categoryMixQuery = Vendor.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "categoryInfo" } },
        { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
        { $project: { name: { $ifNull: ["$categoryInfo.name", "General"] }, value: "$count" } },
        { $group: { _id: "$name", value: { $sum: "$value" } } },
        { $project: { _id: 0, name: "$_id", value: 1 } }
    ]);

    const [stats, financialStats, monthlyGrowth, wizardPending, treePending, categoryMix, openRFQs] = await Promise.all([
        statsQuery,
        financialQuery,
        monthlyQuery,
        VendorApplication.countDocuments({ status: { $in: ["submitted", "under_review", "pending"] } }),
        TreeSubmission.countDocuments({ status: { $in: ["pending", "submitted"] } }),
        categoryMixQuery,
        RFQ.countDocuments({ status: "published" })
    ]);

    const pendingApprovals = wizardPending + treePending;

    // Format monthly growth for frontend
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlyStats = monthlyGrowth.map(item => ({
        month: monthNames[item._id.month - 1],
        count: item.count
    }));

    const result = stats.length > 0 ? stats[0] : {
        totalVendors: 0,
        activeVendors: 0,
        averageRating: 0
    };

    const financial = financialStats.length > 0 ? financialStats[0] : { totalSpend: 0, totalOrders: 0 };

    res.status(200).json({
        success: true,
        message: "Vendor statistics fetched successfully",
        data: {
            ...result,
            totalOrders: financial.totalSpend, // Map spend to totalOrders field as frontend expects it there
            orderCount: financial.totalOrders,
            openRFQs,
            pendingApprovals,
            categoryMix,
            monthlyVendorStats: formattedMonthlyStats
        }
    });
});
