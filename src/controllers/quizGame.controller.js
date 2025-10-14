const ageGroupModel = require("../models/ageGroup.model");
const quizGameModel = require("../models/quizGame.model");
const subjectKitModel = require("../models/subjectKit.model");
const uploadToCloudinary = require("../services/upload.service");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

class QuizGameController {
    create = asyncHandler(async (req, res) => {
        const { title, ageGroup, subjectKit, question, correctOption } = req.body;

        const existingKit = await subjectKitModel.findById(subjectKit);
        if (!existingKit) throw new ApiError(404, "Subject kit not found");

        const ageGroupExists = await ageGroupModel.findById(ageGroup);
        if (!ageGroupExists) throw new ApiError(404, "Age group not found");

        let optionsInput = req.body.options;

        if (typeof optionsInput === "string") {
            try {
                optionsInput = JSON.parse(optionsInput);
            } catch (err) {
                throw new ApiError(400, "Options must be a valid JSON array");
            }
        }

        let finalOptions = [];

        if (
            Array.isArray(optionsInput) &&
            optionsInput.length === 4 &&
            optionsInput.every(
                (opt) =>
                    typeof opt === "object" &&
                    ["text", "image"].includes(opt.type) &&
                    typeof opt.value === "string" &&
                    opt.value.trim().length > 0
            )
        ) {
            finalOptions = optionsInput.map((opt) => ({
                type: opt.type,
                value: opt.value.trim(),
            }));
        }
        else if (req.files?.options) {
            const imageFiles = Array.isArray(req.files.options)
                ? req.files.options
                : [req.files.options];

            if (imageFiles.length !== 4) {
                throw new ApiError(400, "Exactly four image options are required");
            }

            for (const file of imageFiles) {
                if (!file.mimetype.startsWith("image/")) {
                    throw new ApiError(400, "All files must be images");
                }

                try {
                    const uploaded = await uploadToCloudinary(file.buffer, 'QuizGames', 'image');
                    finalOptions.push({
                        type: "image",
                        value: uploaded.secure_url,
                    });
                } catch (err) {
                    throw new ApiError(500, `Image upload failed: ${err.message}`);
                }
            }
        } else {
            throw new ApiError(
                400,
                "Options must be an array of 4 objects with type and value, or 4 image files"
            );
        }

        const validOptionValues = finalOptions.map((opt) => opt.value);
        if (!validOptionValues.includes(correctOption)) {
            throw new ApiError(
                400,
                "Correct option must match one of the provided options"
            );
        }

        const newQuiz = await quizGameModel.create({
            title: title.trim(),
            ageGroup,
            subjectKit,
            question: question.trim(),
            options: finalOptions,
            correctOption,
        });

        res.status(201).json(
            new ApiResponse(201, newQuiz, "Quiz Game created successfully")
        );
    });





    getAll = asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { subjectKit, ageGroup, title } = req.query;

        // Validate pagination
        if (page < 1 || limit < 1 || limit > 100) {
            throw new ApiError(
                400,
                "Page must be >= 1 and limit must be between 1 and 100"
            );
        }

        const filter = {};
        if (subjectKit) filter.subjectKit = subjectKit;
        if (ageGroup) filter.ageGroup = ageGroup;
        if (title) filter.title = { $regex: title, $options: "i" };

        const allQuizGames = await quizGameModel
            .find(filter)
            .populate("ageGroup", "name")
            .populate("subjectKit", "name")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await quizGameModel.countDocuments(filter);

        res.status(200).json(
            new ApiResponse(
                200,
                {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                    results: allQuizGames,
                },
                allQuizGames.length === 0
                    ? "No quiz games found"
                    : "Quiz games fetched successfully"
            )
        );
    });



}

module.exports = new QuizGameController();