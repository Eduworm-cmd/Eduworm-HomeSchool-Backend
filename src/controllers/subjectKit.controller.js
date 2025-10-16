const { default: mongoose } = require("mongoose");
const subjectKitModel = require("../models/subjectKit.model");
const uploadToCloudinary = require("../services/upload.service");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const ageGroupModel = require("../models/ageGroup.model");

class SubjectKitController {
    create = asyncHandler(async (req, res) => {
        const { name, ageGroup, description, introVideo } = req.body;
        const subjectKitImage = req.files?.subjectKitImage?.[0];
        
        if (!name || !ageGroup || !description || !subjectKitImage || !introVideo) {
            throw new ApiError(400, 'All fields are required');
        }

        const existingKit = await subjectKitModel.findOne({ name });

        if (existingKit) {
            throw new ApiError(400, 'Subject Kit already exists');
        }

        let uploadedImage;
        try {
            uploadedImage = await uploadToCloudinary(subjectKitImage.buffer, 'SubjectKits', 'image');

        } catch (error) {
            console.error('Cloudinary Upload Error:', error);
            throw new ApiError(500, 'Image upload failed');
        }

        const subjectKit = await subjectKitModel.create({
            name,
            ageGroup,
            description,
            subjectKitImage: uploadedImage.secure_url,
            introVideo
        });

        res.status(201).json(
            new ApiResponse(201, subjectKit, 'Subject Kit created successfully')
        );
    });

    getAll = asyncHandler(async (req, res) => {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
        const skip = (page - 1) * limit;

        const { ageGroup, name } = req.query;
        const filter = {};

        if (ageGroup) filter.ageGroup = ageGroup;
        if (name && name.length < 100) {
            filter.name = { $regex: name, $options: "i" };
        }

        const [allSubjectKits, totalSubjectKits] = await Promise.all([
            subjectKitModel.find(filter)
                .populate('ageGroup', 'name')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),
            subjectKitModel.countDocuments(filter)
        ]);

        res.status(200).json(new ApiResponse(200, {
            total: totalSubjectKits,
            allSubjectKits,
            currentPage: page,
            totalPages: Math.ceil(totalSubjectKits / limit),
            limit,
        }, 'Subject Kits fetched successfully'));
    });


    dropdownByAgeGroup = asyncHandler(async (req, res) => {
        const { ageGroup } = req.params;

        if (!mongoose.Types.ObjectId.isValid(ageGroup)) {
            throw new ApiError(400, 'Invalid Age Group ID');
        }

        const ageGroupExists = await ageGroupModel.exists({ _id: ageGroup });
        if (!ageGroupExists) {
            throw new ApiError(404, 'Age Group not found');
        }

        const subjectKits = await subjectKitModel.find({ ageGroup }).select('name');

        if (!subjectKits.length) {
            throw new ApiError(404, 'No Subject Kits found for the given Age Group');
        }

        res.status(200).json(new ApiResponse(200, subjectKits, 'Subject Kits fetched successfully'));
    });



    dropdown = asyncHandler(async (req, res) => {
        const subjectKits = await subjectKitModel.find().select('name');

        if (!subjectKits.length) {
            throw new ApiError(404, 'No Subject Kits found');
        }

        res.status(200).json(new ApiResponse(200, subjectKits, 'Subject Kits fetched successfully'));
    });

}

module.exports = new SubjectKitController();
