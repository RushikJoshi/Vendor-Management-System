const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const configs = require('../config/env');

cloudinary.config({
    cloud_name: configs.CLOUDINARY_CLOUD_NAME,
    api_key: configs.CLOUDINARY_API_KEY,
    api_secret: configs.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'vms_enterprise',
        allowed_formats: ['jpg', 'png', 'pdf', 'xlsx', 'docx'],
        resource_type: 'auto',
    },
});

const allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.pdf', '.xlsx', '.docx']);

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(ext)) {
        return cb(new Error('Invalid file type. Allowed files: JPG, PNG, PDF, XLSX, DOCX.'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 20,
    },
    fileFilter,
});

module.exports = upload;
