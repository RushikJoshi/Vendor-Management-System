const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        fileType: String,
        size: Number,
        public_id: String, // For cloudinary deletion
    },
    { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
