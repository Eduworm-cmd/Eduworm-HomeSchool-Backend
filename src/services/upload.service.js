const cloudinary = require("../config/cloudinary");
const streamifier = require('streamifier'); 

const uploadToCloudinary = (buffer, folder = '', resourceType = 'auto') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

module.exports = uploadToCloudinary;

