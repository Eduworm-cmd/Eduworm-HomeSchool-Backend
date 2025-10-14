const Joi = require("joi");
const mongoose = require("mongoose");

const createQuizGameValidator = {
  body: Joi.object({
    title: Joi.string()
      .required()
      .trim()
      .min(5)
      .max(100)
      .messages({
        "string.min": "Game title must be at least 5 characters",
        "string.max": "Game title must not exceed 100 characters",
        "any.required": "Game title is required",
      }),

    question: Joi.string()
      .required()
      .trim()
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
          type: Joi.string().valid('text', 'image').required(),
          value: Joi.string().trim().min(1).max(200).required(),
        })
      )
      .length(4)
      .required()
      .messages({
        "any.required": "Options are required",
        "array.length": "Options must contain exactly 4 items",
      }),

    correctOption: Joi.string()
      .required()
      .trim()
      .min(1)
      .max(200)
      .messages({
        "string.min": "Correct option must be at least 1 character",
        "string.max": "Correct option must not exceed 200 characters",
        "any.required": "Correct option is required",
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
  }).unknown(false),
};

module.exports = createQuizGameValidator;
