const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
    {
        rfqId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RFQ",
            required: true,
        },
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        items: [
            {
                rfqItemId: mongoose.Schema.Types.ObjectId,
                unitPrice: Number,
                totalPrice: Number,
                notes: String,
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        validUntil: Date,
        status: {
            type: String,
            enum: ["submitted", "accepted", "rejected", "withdrawn"],
            default: "submitted",
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Quotation", quotationSchema);
