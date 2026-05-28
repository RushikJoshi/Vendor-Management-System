const mongoose = require("mongoose");

const salesOrderSchema = new mongoose.Schema(
    {
        soNumber: {
            type: String,
            required: true,
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client",
            required: true,
        },
        items: [
            {
                name: { type: String, required: true, trim: true },
                quantity: { type: Number, required: true, min: 1 },
                unitPrice: { type: Number, required: true, min: 0 },
                totalPrice: { type: Number, required: true, min: 0 },
                hsn: String,
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["Draft", "Sent", "Accepted", "Invoiced", "Paid", "Cancelled"],
            default: "Draft",
        },
        expectedDeliveryDate: Date,
        deliveryAddress: String,
        pdfUrl: String,
        notes: String,
        payment: {
            method: String,
            reference: String,
            amount: Number,
            paidAt: Date,
            paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
        statusHistory: [
            {
                from: String,
                to: String,
                changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                changedAt: { type: Date, default: Date.now },
                remarks: String,
            },
        ],
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

salesOrderSchema.index({ tenantId: 1, status: 1 });
salesOrderSchema.index({ tenantId: 1, clientId: 1, createdAt: -1 });
salesOrderSchema.index({ tenantId: 1, soNumber: 1 }, { unique: true });

module.exports = mongoose.model("SalesOrder", salesOrderSchema);
