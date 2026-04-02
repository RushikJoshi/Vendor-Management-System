const cloudinary = require("cloudinary").v2;
const configs = require("./env");

cloudinary.config({
    cloud_name: configs.CLOUDINARY_CLOUD_NAME,
    api_key: configs.CLOUDINARY_API_KEY,
    api_secret: configs.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
