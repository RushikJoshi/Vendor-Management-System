const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: false // Optional for global roles
    },
    permissions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Permission",
        },
    ],
    minLimit: {
        type: Number,
        default: 0
    },
    maxLimit: {
        type: Number,
        default: 0
    },
    accessibleModules: [
        {
            type: String, // e.g., "HR", "Sales", "Inventory", "Vendor Management"
        }
    ],
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// Ensure unique role name per tenant
roleSchema.index({ name: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model("Role", roleSchema);
