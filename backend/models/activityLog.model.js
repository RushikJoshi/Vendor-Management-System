const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: [true, "Action is required"],
            uppercase: true,
        },
        entityType: {
            type: String,
            required: [true, "Entity type is required"],
            enum: ["Vendor", "User", "Category", "Contract"],
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Entity ID is required"],
            refPath: "entityType",
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User who performed action is required"],
        },
        oldData: {
            type: Object,
        },
        newData: {
            type: Object,
        },
        ipAddress: {
            type: String,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
