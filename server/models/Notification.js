const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Using User model for universality
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["vendor", "rfq", "application", "contract"],
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        relatedEntityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);

