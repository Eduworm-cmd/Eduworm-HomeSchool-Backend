const Joi = require("joi");

const userValidator = {
    updateProfile: {
        body: Joi.object({
            name: Joi.string().min(3).max(20).trim(),
            email: Joi.string().email().trim().lowercase(),
            location: Joi.string().trim().allow(' '),
            profile: Joi.string().uri().allow('')
        }).min(1).messages({
            'object.min': 'At least one field must be provided for update'
        })
    },

    addChild: {
        body: Joi.object({
            name: Joi.string().min(3).max(20).trim().required().messages({
                'string.min': 'Child name must be at least 2 characters',
                'string.max': 'Child name cannot exceed 50 characters',
                'any.required': 'Child name is required'
            }),
            dateOfBirth: Joi.date().required().max('now').messages({
                'date.max': 'Date of birth cannot be in the future',
                'any.required': 'Date of birth is required'
            }),
        })
    },

    updateChild: {
        params: Joi.object({
            childId: Joi.string()
                .required()
                .pattern(/^[0-9a-fA-F]{24}$/)
                .messages({
                    'string.pattern.base': 'Invalid child ID format',
                    'any.required': 'Child ID is required'
                })
        }),
        body: Joi.object({
            name: Joi.string().min(2).max(50).trim(),
            dateOfBirth: Joi.date().max('now'),
        }).min(1).messages({
            'object.min': 'At least one field must be provided for update'
        })
    },

    childId: {
        params: Joi.object({
            childId: Joi.string()
                .required()
                .pattern(/^[0-9a-fA-F]{24}$/)
                .messages({
                    'string.pattern.base': 'Invalid child ID format',
                    'any.required': 'Child ID is required'
                })
        })
    }


}


module.exports = userValidator;