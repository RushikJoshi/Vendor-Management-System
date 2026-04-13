const mongoose = require("mongoose");

const rfqSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "RFQ title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "RFQ description is required"],
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: false,
        },
        // Step 2: Requirement Details
        items: [
            {
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                unit: { type: String, enum: ["Nos", "Ton", "Kg", "Litre", "Meter"], default: "Nos" },
                specifications: String,
            },
        ],
        // Step 3: Budget & Timeline
        budget: {
            amount: Number,
            currency: { type: String, default: "USD" },
        },
        quoteDeadline: {
            type: Date,
            required: [true, "Quote submission deadline is required"],
        },
        deliveryDeadline: {
            type: Date,
        },
        // Step 4: Vendor Selection
        vendorSelection: {
            type: { type: String, enum: ["open", "targeted"], default: "open" },
            targetedVendors: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Vendor"
            }],
        },
        // Step 5: Attachments & Terms
        attachments: [
            {
                name: String,
                url: String,
                fileType: String,
            }
        ],
        termsAndConditions: {
            type: String,
        },
        // Step 6: Approval Flow
        approvals: {
            manager: {
                required: { type: Boolean, default: false },
                status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
                approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                approvedAt: Date,
            },
            finance: {
                required: { type: Boolean, default: false },
                status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
                approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                approvedAt: Date,
            }
        },
        status: {
            type: String,
            enum: ["draft", "published", "closed", "cancelled"],
            default: "draft",
        },
        sourcePrId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PurchaseRequest",
            default: null,
            index: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
            index: true,
        },
        sentAt: {
            type: Date,
            default: null,
        },
        sentVendorCount: {
            type: Number,
            default: 0,
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

// Indexing for faster searches
rfqSchema.index({ tenantId: 1, status: 1 });
rfqSchema.index({ departmentId: 1 });
rfqSchema.index({ tenantId: 1, sourcePrId: 1 });
rfqSchema.index({ tenantId: 1, categoryId: 1, status: 1 });

module.exports = mongoose.model("RFQ", rfqSchema);
