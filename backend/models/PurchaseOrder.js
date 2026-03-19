const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
    {
        poNumber: {
            type: String,
            required: true,
            unique: true,
        },
        rfqId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RFQ",
        },
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        quotationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quotation",
        },
        items: [
            {
                name: String,
                quantity: Number,
                unitPrice: Number,
                totalPrice: Number,
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["draft", "sent", "accepted", "delivered", "paid", "cancelled"],
            default: "draft",
        },
        deliveryTracking: {
            carrier: String,
            trackingNumber: String,
            estimatedDelivery: Date,
            actualDelivery: Date,
            status: String,
        },
        pdfUrl: String,
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

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
