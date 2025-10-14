const config = require('../config/env');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name:config.cloudinaryName,
    api_key:config.cloudinaryApiKey,
    api_secret:config.cloudinarySecret
});

module.exports = cloudinary;