const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: [
            "Super Admin",
            "Technical Reviewer",
            "Finance Reviewer",
            "Compliance Officer",
            "Procurement Manager",
            "Vendor"
        ],
    },
    permissions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Permission",
        },
    ],
});

module.exports = mongoose.model("Role", roleSchema);
