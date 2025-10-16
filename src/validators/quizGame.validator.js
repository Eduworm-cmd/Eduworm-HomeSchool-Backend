const Joi = require("joi");
const mongoose = require("mongoose");

const createQuizGameValidator = {
  body: Joi.object({
    title: Joi.string()
      .required()
      .min(5)
      .max(100)
      .messages({
        "string.min": "Game title must be at least 5 characters",
        "string.max": "Game title must not exceed 100 characters",
        "any.required": "Game title is required",
      }),

    questions: Joi.array()
      .items(
        Joi.object({
          question: Joi.string()
            .required()
            .min(5)
            .max(200)
            .messages({
              "string.min": "Question must be at least 5 characters",
              "string.max": "Question must not exceed 200 characters",
              "any.required": "Question is required",
            }),

          options: Joi.array()
            .items(
              Joi.object({
                text: Joi.string().allow('').max(200),
                image: Joi.string().uri().allow('').max(500),
              }).or('text', 'image') // At least one of them must be present
            )
            .length(4)
            .required()
            .messages({
              "any.required": "Options are required",
              "array.length": "Each question must have exactly 4 options",
            }),

          correctOptionIndex: Joi.number()
            .integer()
            .min(0)
            .max(3)
            .required()
            .messages({
              "number.base": "Correct option index must be a number between 0 and 3",
              "number.min": "Correct option index must be at least 0",
              "number.max": "Correct option index must be at most 3",
              "any.required": "Correct option index is required",
            }),
        })
      )
      .min(1)
      .required()
      .messages({
        "any.required": "Questions are required",
        "array.min": "At least one question is required",
      }),

    ageGroup: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      })
      .messages({
        "any.invalid": "Age Group ID must be a valid MongoDB ObjectId",
        "any.required": "Age Group is required",
      }),

    subjectKit: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      })
      .messages({
        "any.invalid": "Subject Kit ID must be a valid MongoDB ObjectId",
        "any.required": "Subject Kit is required",
      }),

    gameType: Joi.string()
      .valid("QuizGame")
      .optional(),
  }).unknown(false),
};

module.exports = createQuizGameValidator;
