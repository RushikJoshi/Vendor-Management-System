const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false, // system actions might not have a userId
        },
        userRole: String,
        actionType: {
            type: String,
            required: true,
        },
        entityType: {
            type: String, // Vendor, Application, Stage, Category, User
            required: true,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
        },
        beforeData: mongoose.Schema.Types.Mixed,
        afterData: mongoose.Schema.Types.Mixed,
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        ipAddress: String,
        userAgent: String,
    },
    {
        timestamps: { createdAt: true, updatedAt: false }, // Only createdAt
        versionKey: false // No versioning needed for immutable logs
    }
);

// Performance Indexes
auditLogSchema.index({ entityId: 1 });
auditLogSchema.index({ createdAt: 1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ actionType: 1 });
auditLogSchema.index({ entityType: 1 });

/**
 * 🔐 Immutability Enforcement
 */

// Prevent updates via save()
auditLogSchema.pre("save", async function () {
    if (!this.isNew) {
        throw new Error("❌ Immutable Audit Log: Modification is prohibited.");
    }
});

// Prevent updates via update methods
const preventUpdate = function (next) {
    next(new Error("❌ Immutable Audit Log: Modification is prohibited."));
};

auditLogSchema.pre("updateOne", preventUpdate);
auditLogSchema.pre("updateMany", preventUpdate);
auditLogSchema.pre("findOneAndUpdate", preventUpdate);
auditLogSchema.pre("findByIdAndUpdate", preventUpdate);

// Prevent deletions
const preventDelete = function (next) {
    next(new Error("❌ Immutable Audit Log: Deletion is prohibited."));
};

auditLogSchema.pre("remove", preventDelete);
auditLogSchema.pre("deleteOne", preventDelete);
auditLogSchema.pre("deleteMany", preventDelete);
auditLogSchema.pre("findOneAndDelete", preventDelete);
auditLogSchema.pre("findByIdAndDelete", preventDelete);

module.exports = mongoose.model("AuditLog", auditLogSchema);
