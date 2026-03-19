const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        poId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PurchaseOrder",
            required: true,
        },
        score: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        review: String,
        criteria: {
            quality: { type: Number, min: 1, max: 5 },
            delivery: { type: Number, min: 1, max: 5 },
            communication: { type: Number, min: 1, max: 5 },
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Rating", ratingSchema);
