const mongoose = require("mongoose");

const salesOrderSchema = new mongoose.Schema(
    {
        soNumber: {
            type: String,
            required: true,
            unique: true,
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client",
            required: true,
        },
        items: [
            {
                name: String,
                quantity: Number,
                unitPrice: Number,
                totalPrice: Number,
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

module.exports = mongoose.model("SalesOrder", salesOrderSchema);
