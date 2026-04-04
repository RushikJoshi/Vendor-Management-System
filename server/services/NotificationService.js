const Notification = require("../models/Notification");
const { emitNotification } = require("../utils/socket");
const User = require("../models/User");
const { normalizeRole } = require("../config/roles");

/**
 * Send a notification to a specific user
 */
const sendNotification = async (userId, data) => {
    try {
        const notification = await Notification.create({
            userId,
            ...data
        });
        emitNotification(userId, notification);
        return notification;
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

/**
 * Alias for sendNotification
 */
const notify = sendNotification;

/**
 * Send notification to all admins with a specific role
 */
const notifyAdminsByRole = async (role, data) => {
    try {
        // Find users with specific role. 
        // Note: Check if 'role' field or 'roleName' is used.
        const admins = await User.find({ 
            $or: [
                { role: role.toLowerCase() },
                { roleName: role }
            ]
        });
        
        for (const admin of admins) {
            await sendNotification(admin._id, data);
        }
    } catch (error) {
        console.error(`Error notifying admins with role ${role}:`, error);
    }
};

/**
 * Send notification to all admins (superadmins or company admins)
 */
const notifyAllAdmins = async (data) => {
    try {
        const admins = await User.find();
        const adminUsers = admins.filter((user) => normalizeRole(user.role) === "admin");
        for (const admin of adminUsers) {
            await sendNotification(admin._id, data);
        }
    } catch (error) {
        console.error("Error notifying all admins:", error);
    }
};

/**
 * Send notification to all internal users within a tenant (non-vendor).
 */
const notifyInternalUsers = async (tenantId, data, options = {}) => {
    try {
        if (!tenantId) return [];

        const users = await User.find({
            tenantId,
            status: "active",
        }).select("_id role");

        const excludeId = options.excludeUserId ? String(options.excludeUserId) : null;
        const internalUsers = users.filter((user) => {
            if (excludeId && String(user._id) === excludeId) return false;
            return normalizeRole(user.role) !== "vendor";
        });

        for (const user of internalUsers) {
            await sendNotification(user._id, data);
        }

        return internalUsers;
    } catch (error) {
        console.error("Error notifying internal users:", error);
        return [];
    }
};

module.exports = {
    sendNotification,
    notify,
    notifyAdminsByRole,
    notifyAllAdmins,
    notifyInternalUsers
};

