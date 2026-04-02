const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
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
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
