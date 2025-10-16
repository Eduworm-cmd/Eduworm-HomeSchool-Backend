const mongoose = require("mongoose");

const quizGameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  questions: [
    {
      question: { type: String, required: true },
      options: [
        {
          text: { type: String },
          image: { type: String },
        },
      ],
      correctOptionIndex: { type: Number, required: true },
    },
  ],
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
  gameType: {
    type: String,
    default: 'QuizGame'
  }
}, {
  timestamps: true
});

quizGameSchema.index({ subjectKit: 1, ageGroup: 1 });
quizGameSchema.index({ title: 1 });

module.exports = mongoose.model("QuizGame", quizGameSchema);

