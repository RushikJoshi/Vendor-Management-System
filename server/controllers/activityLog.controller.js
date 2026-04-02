const ActivityLog = require("../models/activityLog.model");
const APIFeatures = require("../utils/apiFeatures");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    Get all activity logs
 * @route   GET /api/activity-logs
 * @access  Private/Admin
 */
exports.getActivityLogs = asyncHandler(async (req, res, next) => {
    // 1) Get total count for metadata
    const countFeatures = new APIFeatures(ActivityLog.find(), req.query).filter();
    const totalResults = await countFeatures.query.countDocuments();

    // 2) Get data with features
    const features = new APIFeatures(
        ActivityLog.find().populate("performedBy", "name email").populate("entityId", "name companyName"),
        req.query
    )
        .filter()
        .sort()
        .paginate();

    const logs = await features.query;

    const resultsPerPage = parseInt(req.query.limit, 10) || 10;
    const currentPage = parseInt(req.query.page, 10) || 1;
    const totalPages = Math.ceil(totalResults / resultsPerPage);

    res.status(200).json({
        success: true,
        message: "Activity logs fetched successfully",
        totalResults,
        currentPage,
        totalPages,
        resultsPerPage,
        data: logs,
    });
});
