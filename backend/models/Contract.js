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
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },
    },
    { timestamps: true }
);

contractSchema.index({ vendorId: 1 });
contractSchema.index({ endDate: 1 });
contractSchema.index({ status: 1 });

module.exports = mongoose.model("Contract", contractSchema);
