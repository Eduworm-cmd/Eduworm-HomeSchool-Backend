const subjectKitModel = require("../models/subjectKit.model");
const uploadToCloudinary = require("../services/upload.service");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

class SubjectKitController {
    create = asyncHandler(async (req, res) => {
        const { name, ageGroup, description, introVideo } = req.body;
        const thumbnail = req.files?.thumbnail?.[0];        

        if (!name || !ageGroup || !description || !thumbnail || !introVideo) {
            throw new ApiError(400, 'All fields are required');
        }

        const existingKit = await subjectKitModel.findOne({ name });

        if (existingKit) {
            throw new ApiError(400, 'Subject Kit already exists');
        }

        let uploadedImage;
        try {
            uploadedImage = await uploadToCloudinary(thumbnail.buffer, 'SubjectKits', 'image');

        } catch (error) {
            console.error('Cloudinary Upload Error:', error);
            throw new ApiError(500, 'Image upload failed');
        }

        const subjectKit = await subjectKitModel.create({
            name,
            ageGroup,
            description,
            thumbnail: uploadedImage.secure_url,
            introVideo
        });

        res.status(201).json(
            new ApiResponse(201, subjectKit, 'Subject Kit created successfully')
        );
    });
}

module.exports = new SubjectKitController();
