const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        contractNumber: {
            type: String,
            required: true,
            unique: true,
        },
        contractTitle: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        contractValue: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: "INR",
        },
        contractType: {
            type: String,
            enum: ["MSA", "SOW", "NDA", "SLA", "Licensing", "Others"],
            default: "MSA",
        },
        paymentTerms: {
            type: String,
            default: "Net 30",
        },
        noticePeriod: {
            type: Number, // in days
            default: 30,
        },
        internalOwner: String,
        description: String,
        status: {
            type: String,
            enum: ["active", "expired", "terminated"],
            default: "active",
        },
        renewalReminderSent: {
            type: Boolean,
            default: false,
        },
        documentUrl: String,
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        rfqId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RFQ",
        },
        quotationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quotation",
        },
    },
    { timestamps: true }
);

contractSchema.index({ tenantId: 1 });
contractSchema.index({ vendorId: 1 });
contractSchema.index({ endDate: 1 });
contractSchema.index({ status: 1 });

module.exports = mongoose.model("Contract", contractSchema);
