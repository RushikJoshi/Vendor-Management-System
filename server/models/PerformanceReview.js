const mongoose = require("mongoose");

const performanceReviewSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        reviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
        },
        qualityScore: {
            type: Number, // 0-100
            required: true,
            min: 0,
            max: 100
        },
        deliveryScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        complianceScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        communicationScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        overallScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        remarks: String,
        reviewDate: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

performanceReviewSchema.index({ vendorId: 1 });
performanceReviewSchema.index({ overallScore: 1 });

module.exports = mongoose.model("PerformanceReview", performanceReviewSchema);
