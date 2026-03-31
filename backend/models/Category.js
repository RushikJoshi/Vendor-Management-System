const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        // Meta-data for advanced scoring/rules (Optional but kept for SaaS level)
        criteria: {
            minimumTurnover: { type: Number, default: 0 },
            minimumExperienceYears: { type: Number, default: 0 },
            mandatoryDocuments: [{ type: String }],
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
