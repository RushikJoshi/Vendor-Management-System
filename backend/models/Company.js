const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Company email is required"],
            unique: true,
            lowercase: true,
        },
        domain: {
          type: String,
          unique: true,
          sparse: true
        },
        subscription: {
            plan: {
                type: String,
                enum: ["free", "pro", "enterprise"],
                default: "free",
            },
            status: {
                type: String,
                enum: ["active", "past_due", "canceled", "incomplete"],
                default: "active",
            },
            expiryDate: Date,
        },
        settings: {
            logo: String,
            primaryColor: {
                type: String,
                default: "#4F46E5",
            },
            currency: {
                type: String,
                default: "USD",
            },
        },
        usage: {
            vendorCount: { type: Number, default: 0 },
            rfqCount: { type: Number, default: 0 },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
