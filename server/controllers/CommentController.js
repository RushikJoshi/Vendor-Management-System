const Comment = require("../models/Comment");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

exports.addComment = asyncHandler(async (req, res) => {
    const { targetModel, targetId, content, isInternal } = req.body;
    
    if (!targetModel || !targetId || !content) {
        throw new AppError("targetModel, targetId and content are required", 400);
    }

    const comment = await Comment.create({
        targetModel,
        targetId,
        content,
        isInternal: !!isInternal,
        userId: req.user.id,
        tenantId: req.user.tenantId
    });

    const populated = await Comment.findById(comment._id).populate("userId", "name role");

    // NOTIFICATION LOGIC
    try {
        let recipientIds = [];
        let title = `New Message on ${targetModel}`;
        let message = `${req.user.name} added a comment: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`;
        let type = "comment";

        if (targetModel === "PurchaseOrder") {
            const PurchaseOrder = require("../models/PurchaseOrder");
            const po = await PurchaseOrder.findById(targetId).populate("vendorId");
            if (po) {
                if (req.user.role === "vendor") {
                    // Notify Admin/Procurement team of the tenant
                    const User = require("../models/User");
                    const admins = await User.find({ 
                        tenantId: po.tenantId, 
                        role: { $in: ["admin", "procurement", "system_admin"] } 
                    });
                    recipientIds = admins.map(a => a._id);
                } else {
                    // Notify Vendor
                    const User = require("../models/User");
                    const vendorUser = await User.findOne({ email: po.vendorId.email, role: "vendor" });
                    if (vendorUser) recipientIds = [vendorUser._id];
                }
            }
        } else if (targetModel === "RFQ") {
            const RFQ = require("../models/RFQ");
            const rfq = await RFQ.findById(targetId);
            if (rfq) {
                if (req.user.role === "vendor") {
                     const User = require("../models/User");
                     const admins = await User.find({ 
                         tenantId: rfq.tenantId, 
                         role: { $in: ["admin", "procurement", "system_admin"] } 
                     });
                     recipientIds = admins.map(a => a._id);
                } else {
                    // If targeted RFQ, notify those vendors
                    // For now, simpler: notify recipients if it's a direct response
                }
            }
        }

        if (recipientIds.length > 0) {
            const Notification = require("../models/Notification");
            const notifications = recipientIds.map(uid => ({
                userId: uid,
                title,
                message,
                type,
                relatedEntityId: targetId
            }));
            await Notification.insertMany(notifications);
        }
    } catch (err) {
        console.error("Notification trigger failed", err);
    }

    res.status(201).json({ success: true, data: populated });
});

exports.getComments = asyncHandler(async (req, res) => {
    const { targetModel, targetId } = req.params;
    
    const filter = {
        targetModel,
        targetId,
        tenantId: req.user.tenantId
    };

    // If user is a vendor, they shouldn't see internal comments
    if (req.user.role === "vendor") {
        filter.isInternal = false;
    }

    const comments = await Comment.find(filter)
        .populate("userId", "name role")
        .sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: comments });
});

exports.getAllComments = asyncHandler(async (req, res) => {
    const filter = { tenantId: req.user.tenantId };
    
    // Vendors can only see their own (this shouldn't be called by vendors though)
    if (req.user.role === "vendor") {
        return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const comments = await Comment.find(filter)
        .populate("userId", "name role")
        .sort({ createdAt: -1 })
        .limit(50);

    res.status(200).json({ success: true, data: comments });
});
