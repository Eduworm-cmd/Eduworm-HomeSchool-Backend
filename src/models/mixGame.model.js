const mongoose = require("mongoose");

const mixGamesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Game title is required'],
        trim: true,
    },
    ageGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AgeGroup',
        required: [true, 'Age group is required']
    },
    subjectKit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubjectKit',
        required: [true, 'Subject Kit is required']
    },
    questions: [
        {
            gameType: {
                type: String,
            },
            question: {
                type: String,
                required: [true, 'Question is required'],
            },
            options: [
                {
                    text: { type: String, required: [true, 'Option text is required'] },
                    image: { type: String, required: [true, 'Option image is required'] }
                }
            ],
            correctOption: {
                type: Number,
                required: [true, 'Correct option is required'],
            }
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model("MixGame", mixGamesSchema);
