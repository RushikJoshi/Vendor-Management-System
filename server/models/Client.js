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
            unique: true,
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

module.exports = mongoose.model("Client", clientSchema);
