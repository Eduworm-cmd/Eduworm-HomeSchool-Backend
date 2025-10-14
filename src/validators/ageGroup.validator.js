const Joi = require('joi');

const createAgeGroupValidator = {
  body: Joi.object({
    min: Joi.number()
      .integer()
      .min(0)
      .required()
      .label('Minimum age'),

    max: Joi.number()
      .integer()
      .min(Joi.ref('min'))
      .required()
      .label('Maximum age')
      .messages({
        'number.min': `"Maximum age" must be greater than or equal to "Minimum age"`
      }),
  }),
};

module.exports = createAgeGroupValidator;
