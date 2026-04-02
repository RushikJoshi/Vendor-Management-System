const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Department name is required"],
            trim: true,
        },
        description: String,
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
    },
    { timestamps: true }
);

// Ensure name is unique per tenant
departmentSchema.index({ name: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model("Department", departmentSchema);
