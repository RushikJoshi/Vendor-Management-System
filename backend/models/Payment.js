const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        poId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PurchaseOrder",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        paymentDate: {
            type: Date,
            default: Date.now,
        },
        method: {
            type: String,
            enum: ["bank_transfer", "card", "cash", "check"],
            required: true,
        },
        transactionRef: String,
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
