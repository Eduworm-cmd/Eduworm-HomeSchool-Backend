const Joi = require("joi");

const adminValidators = {
    adminRegistration: {
        body: Joi.object({
            name: Joi.string()
                .required()
                .min(3)
                .max(20)
                .trim()
                .messages({
                    'string.min': 'Name must be at least 3 characters',
                    'string.max': 'Name cannot exceed 20 characters',
                    'any.required': 'Name is required'
                }),

            email: Joi.string()
                .email()
                .required()
                .trim()
                .lowercase()
                .messages({
                    'string.email': 'Please provide a valid email address',
                    'any.required': 'Email is required'
                }),

            password: Joi.string()
                .required()
                .trim()
                .min(6)
                .max(20)
                .messages({
                    'string.min': 'Password must be at least 6 characters',
                    'string.max': 'Password must not exceed 20 characters',
                    'any.required': 'Password is required'
                })
        })
    },

    adminLogin: {
        body: Joi.object({
            email: Joi.string()
                .email()
                .required()
                .trim()
                .lowercase()
                .messages({
                    'string.email': 'Please provide a valid email address',
                    'any.required': 'Email is required'
                }),

            password: Joi.string()
                .required()
                .min(6)
                .max(20)
                .trim()
                .messages({
                    'string.min': 'Password must be at least 6 characters',
                    'string.max': 'Password must not exceed 20 characters',
                    'any.required': 'Password is required'
                })
        })
    }
};

module.exports = adminValidators;
