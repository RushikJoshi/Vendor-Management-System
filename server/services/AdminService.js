const Vendor = require("../models/Vendor");
const VendorApplication = require("../models/VendorApplication");
const Message = require("../models/Message");
const Contract = require("../models/Contract");
const AuditLog = require("../models/AuditLog");
const AuditService = require("./AuditService");
const { sendEmail } = require("../utils/emailService");

const redisConnection = require("../config/redis");
const logger = require("../utils/logger");

class AdminService {
    static async getDashboardStats() {
        // Try to get from cache
        const cacheKey = "admin:dashboard:stats";
        try {
            const cachedStats = await redisConnection.get(cacheKey);
            if (cachedStats) {
                logger.info("Serving dashboard stats from cache");
                return JSON.parse(cachedStats);
            }
        } catch (err) {
            logger.warn("Redis cache error: " + err.message);
        }

        const totalVendors = await Vendor.countDocuments();
        const pendingApprovals = await VendorApplication.countDocuments({ status: "submitted" });
        const blacklisted = await Vendor.countDocuments({ lifecycleStatus: "blacklisted" });
        const activeContracts = await Contract.countDocuments({ status: "active" });

        const highRiskVendors = await Vendor.countDocuments({ riskLevel: "High" });
        const medRiskVendors = await Vendor.countDocuments({ riskLevel: "Medium" });

        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
        const expiringSoon = await Contract.countDocuments({
            status: "active",
            endDate: { $lte: thirtyDaysLater, $gt: new Date() }
        });

        return {
            totalVendors,
            pendingApprovals,
            blacklisted,
            activeContracts,
            expiringSoon,
            riskStats: {
                high: highRiskVendors,
                medium: medRiskVendors,
                low: Math.max(0, totalVendors - (highRiskVendors + medRiskVendors))
            }
        };

        // Cache the result for 5 minutes (300 seconds)
        try {
            await redisConnection.setex(cacheKey, 300, JSON.stringify(stats));
        } catch (err) {
            logger.warn("Redis set cache error: " + err.message);
        }

        return stats;
    }

    static async getVendors({ status, search, page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        let query = {};
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { companyName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const vendors = await Vendor.find(query)
            .sort("-createdAt")
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Vendor.countDocuments(query);

        return {
            vendors,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
            }
        };
    }

    static async updateVendorStatus(id, { status, remarks }, req) {
        const vendor = await Vendor.findById(id);
        if (!vendor) throw new Error("Vendor not found");

        const oldStatus = vendor.status;
        vendor.status = status;
        await vendor.save();

        await AuditService.logStatusChange(req, "Vendor", vendor._id, oldStatus, status, remarks);

        await sendEmail({
            to: vendor.email,
            subject: `Account ${status}`,
            html: `<p>Your vendor account has been <strong>${status}</strong>.</p>`,
        });

        return vendor;
    }

    static async getAuditLogs({ entityType, actionType, entityId, userId, page = 1, limit = 50 }) {
        const skip = (page - 1) * limit;

        let query = {};
        if (entityType) query.entityType = entityType;
        if (actionType) query.actionType = actionType;
        if (entityId) query.entityId = entityId;
        if (userId) query.userId = userId;

        const logs = await AuditLog.find(query)
            .sort("-createdAt")
            .skip(skip)
            .limit(parseInt(limit));

        const total = await AuditLog.countDocuments(query);

        return {
            logs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
            }
        };
    }
}

module.exports = AdminService;
