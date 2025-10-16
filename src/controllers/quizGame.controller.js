const ageGroupModel = require("../models/ageGroup.model");
const quizGameModel = require("../models/quizGame.model");
const subjectKitModel = require("../models/subjectKit.model");
const uploadToCloudinary = require("../services/upload.service");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

class QuizGameController {

    create = asyncHandler(async (req, res) => {
        const { title, ageGroup, subjectKit, questions } = req.body;

        if (!title || !Array.isArray(questions) || questions.length === 0 || !ageGroup || !subjectKit) {
            throw new ApiError(400, "Missing required fields");
        }

        const existingKit = await subjectKitModel.findById(subjectKit);
        if (!existingKit) throw new ApiError(404, "Subject kit not found");

        const ageGroupExists = await ageGroupModel.findById(ageGroup);
        if (!ageGroupExists) throw new ApiError(404, "Age group not found");

        const processedQuestions = [];

        for (const q of questions) {
            const { question, options, correctOptionIndex } = q;

            if (!question || !options || correctOptionIndex === undefined) {
                throw new ApiError(400, "Each question must have 'question', 'options', and 'correctOptionIndex'");
            }

            if (
                !Array.isArray(options) ||
                options.length !== 4 ||
                !options.every(
                    (opt) =>
                        typeof opt === "object" &&
                        ((opt.text && typeof opt.text === "string" && opt.text.trim() !== "") ||
                            (opt.image && typeof opt.image === "string" && opt.image.trim() !== ""))
                )
            ) {
                throw new ApiError(
                    400,
                    "Options must be an array of 4 objects with either 'text' or 'image' for each question"
                );
            }

            const finalOptions = options.map((opt) => {
                if (opt.text) return { text: opt.text.trim() };
                if (opt.image) return { image: opt.image.trim() };
                return {};
            });

            if (
                isNaN(correctOptionIndex) ||
                correctOptionIndex < 0 ||
                correctOptionIndex > 3
            ) {
                throw new ApiError(400, "Correct option index must be between 0 and 3");
            }

            processedQuestions.push({
                question: question.trim(),
                options: finalOptions,
                correctOptionIndex,
            });
        }

        const newQuiz = await quizGameModel.create({
            title: title.trim(),
            ageGroup,
            subjectKit,
            questions: processedQuestions,
        });

        res.status(201).json(
            new ApiResponse(201, newQuiz, "Quiz Game with multiple questions created successfully")
        );
    });

    getAll = asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { subjectKit, ageGroup, title } = req.query;

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
            .sort({ createdAt: -1 })
            .lean();

        const total = await quizGameModel.countDocuments(filter);

        res.status(200).json(
            new ApiResponse(
                200,{
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                    allQuizGames,
                },
                allQuizGames.length === 0
                    ? "No quiz games found"
                    : "Quiz games fetched successfully"
            )
        );
    });

}

module.exports = new QuizGameController();