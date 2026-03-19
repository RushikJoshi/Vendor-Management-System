const Vendor = require("../models/vendor.model");
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
                totalOrders: { $sum: "$totalOrders" },
                totalPendingPayments: { $sum: "$pendingPayments" },
                averageRating: { $avg: "$rating" }
            }
        },
        {
            $project: {
                _id: 0,
                totalVendors: 1,
                activeVendors: 1,
                totalOrders: 1,
                totalPendingPayments: 1,
                averageRating: { $round: ["$averageRating", 1] }
            }
        }
    ]);

    // 2) Monthly Growth Statistics (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of month

    const monthlyQuery = Vendor.aggregate([
        {
            $match: {
                isDeleted: { $ne: true },
                createdAt: { $gte: sixMonthsAgo }
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

    const [stats, monthlyGrowth] = await Promise.all([statsQuery, monthlyQuery]);

    // Format monthly growth for frontend
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlyStats = monthlyGrowth.map(item => ({
        month: monthNames[item._id.month - 1],
        count: item.count
    }));

    const result = stats.length > 0 ? stats[0] : {
        totalVendors: 0,
        activeVendors: 0,
        totalOrders: 0,
        totalPendingPayments: 0,
        averageRating: 0
    };

    res.status(200).json({
        success: true,
        message: "Vendor statistics fetched successfully",
        data: {
            ...result,
            monthlyVendorStats: formattedMonthlyStats
        }
    });
});
