const Joi = require("joi");
const mongoose = require("mongoose");

const createSubjectKitValidator = {
  body: Joi.object({
    name: Joi.string()
      .min(5)
      .max(100)
      .required()
      .label('Subject Kit Name')
      .messages({
        'string.min': 'Subject Kit name must be at least 5 characters',
        'string.max': 'Subject Kit name must not exceed 100 characters',
        'any.required': 'Subject Kit name is required'
      }),

    description: Joi.string()
      .min(10)
      .max(300)
      .optional()
      .label('Description'),

    ageGroup: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.message('Age Group ID must be a valid Mongo ObjectId');
        }
        return value;
      })
      .label('Age Group'),

    introVideo: Joi.string()
      .uri()
      .required()
      .label('Intro Video')
      .messages({
        'string.uri': 'Intro Video must be a valid URL',
        'any.required': 'Intro Video is required'
      }),

    isActive: Joi.boolean().optional()
  })
};

module.exports = createSubjectKitValidator;
