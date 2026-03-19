const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true, // e.g., "APPLICATION_VIEW_TECHNICAL"
        },
        module: {
            type: String,
            required: true, // e.g., "APPLICATION", "VENDOR", "AUDIT"
        },
        description: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Permission", permissionSchema);
