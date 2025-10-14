const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'image'],
    required: true
  },
  value: {
    type: String,
    required: true
  }
}, { _id: false });

const quizGameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
  },
  options: {
    type: [optionSchema],
    required: true,
    validate: {
      validator: function (val) {
        return Array.isArray(val) && val.length === 4;
      },
      message: 'Exactly 4 options are required'
    }
  },
  correctOption: {
    type: String,
    required: [true, 'Correct option is required'],
    validate: {
      validator: function (val) {
        return this.options.some(opt => opt.value === val);
      },
      message: 'Correct option must match one of the provided options'
    }
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
  }
}, {
  timestamps: true
});

quizGameSchema.index({ subjectKit: 1, ageGroup: 1 });
quizGameSchema.index({ title: 1 });

module.exports = mongoose.model("QuizGame", quizGameSchema);



