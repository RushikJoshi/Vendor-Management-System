const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        targetModel: {
            type: String,
            required: true,
            enum: ["RFQ", "PurchaseOrder", "Invoice", "Quotation"],
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        isInternal: {
            type: Boolean,
            default: false, // Internal comments only visible to admin/internal staff
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
    },
    { timestamps: true }
);

commentSchema.index({ targetId: 1, targetModel: 1 });

module.exports = mongoose.model("Comment", commentSchema);
