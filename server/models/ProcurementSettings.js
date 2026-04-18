const mongoose = require('mongoose');

const ProcurementHistorySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['PO', 'SO'],
        required: true
    },
    action: {
        type: String,
        default: 'Published Version'
    },
    userLabel: {
        type: String,
        default: 'System'
    },
    snapshot: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const ProcurementSettingsSchema = new mongoose.Schema({
    tenantId: {
        type: String,
        required: true,
        unique: true
    },
    // Unified Storage for both PO and SO to avoid index conflicts
    PO: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    SO: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Global System sequences
    applicationPrefix: { type: String, default: "APP" },
    applicationStartNumber: { type: Number, default: 1001 },
    vendorPrefix: { type: String, default: "VND" },
    vendorStartNumber: { type: Number, default: 2001 },
    poPrefix: { type: String, default: "PO" },
    poStartNumber: { type: Number, default: 1 },
    poSuffix: { type: String, default: "" },
    soPrefix: { type: String, default: "SO" },
    soStartNumber: { type: Number, default: 1 },
    soSuffix: { type: String, default: "" },

    // Track next numbers in DB to avoid collisions
    nextApplicationNumber: { type: Number },
    nextVendorNumber: { type: Number },
    nextPONumber: { type: Number },
    nextSONumber: { type: Number },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    versionHistory: {
        type: [ProcurementHistorySchema],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('ProcurementSettings', ProcurementSettingsSchema);
