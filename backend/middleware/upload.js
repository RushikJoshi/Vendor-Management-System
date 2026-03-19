const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
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
