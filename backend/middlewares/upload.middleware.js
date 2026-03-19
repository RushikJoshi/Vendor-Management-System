const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const AppError = require("../utils/AppError");

// 1. Generic storage helper creator
const createStorage = (folder) => new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: folder,
        allowed_formats: ["jpg", "png", "pdf"],
        resource_type: "auto", // Automatically detect if it's an image or document
    },
});

// 2. File Filter Logic
const fileFilter = (req, file, cb) => {
    // Check extension if needed, but Cloudinary handles basic formats
    // We'll add a specific check for Agreement (PDF only) inside the controller or here
    if (file.fieldname === "agreementFile" && file.mimetype !== "application/pdf") {
        return cb(new AppError("Agreement must be a PDF file", 400), false);
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError("Invalid file type. Only JPG, PNG, and PDF are allowed.", 400), false);
    }
};

// 3. Multer instances
const uploadGST = multer({
    storage: createStorage("vendors/gst"),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter,
});

const uploadAgreement = multer({
    storage: createStorage("vendors/agreements"),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter,
});

module.exports = {
    uploadGST,
    uploadAgreement,
};
