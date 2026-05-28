const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        companyName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
        },
        address: {
            type: String,
        },
        gstin: {
            type: String,
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

clientSchema.index({ tenantId: 1, email: 1 }, { unique: true });
clientSchema.index({ tenantId: 1, companyName: 1 });

module.exports = mongoose.model("Client", clientSchema);
