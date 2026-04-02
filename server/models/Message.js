const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "senderModel",
        },
        senderModel: {
            type: String,
            required: true,
            enum: ["Admin", "Vendor"],
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "receiverModel",
        },
        receiverModel: {
            type: String,
            required: true,
            enum: ["Admin", "Vendor"],
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
