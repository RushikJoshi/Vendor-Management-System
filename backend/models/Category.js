const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },
        description: String,
        isActive: {
            type: Boolean,
            default: true,
        },
        formTemplate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FormTemplate",
        },
        eligibilityRules: [
            {
                ruleName: String, // e.g., "Minimum Turnover"
                ruleKey: String, // e.g., "turnover"
                operator: {
                    type: String,
                    enum: ["greater_than", "less_than", "equals", "contains"],
                },
                value: mongoose.Schema.Types.Mixed,
                isMandatory: {
                    type: Boolean,
                    default: true,
                },
            },
        ],
        requiredDocuments: [
            {
                name: String,
                description: String,
                isMandatory: {
                    type: Boolean,
                    default: true,
                },
            },
        ],
        criteria: {
            minimumTurnover: { type: Number, default: 0 },
            preferredTurnover: { type: Number, default: 0 },
            minimumExperienceYears: { type: Number, default: 0 },
            requiredCertificates: [{ type: String }],
            mandatoryDocuments: [{ type: String }],
            riskThresholdLow: { type: Number, default: 80 },
            riskThresholdMedium: { type: Number, default: 50 }
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
