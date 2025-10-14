const Joi = require("joi");

const authValidators = {
    sendOTP: {
        body: Joi.object({
            phoneNumber: Joi.string().required()
                .pattern(/^\+?[1-9]\d{1,14}$/)
                .messages({
                    'string.pattern.base': 'Please provide a valid phone number with country code (e.g., +919876543210)',
                    'any.required': 'Phone number is required'
                })
        })
    },

    verifyOTP: {
        body: Joi.object({
            phoneNumber: Joi.string()
                .required()
                .pattern(/^\+?[1-9]\d{1,14}$/)
                .messages({
                    'string.pattern.base': 'Please provide a valid phone number',
                    'any.required': 'Phone number is required'
                }),

            otp: Joi.string()
                .required()
                .length(4)
                .pattern(/^\d+$/)
                .messages({
                    'string.length': 'OTP must be 4 digits',
                    'string.pattern.base': 'OTP must contain only numbers',
                    'any.required': 'OTP is required'
                })
        })
    },



    completeRegistration: {
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
                .trim()
                .lowercase()
                .messages({
                    'string.email': 'Please provide a valid email address'
                }),
            location: Joi.string()
                .trim()
                .min(3)
                .max(100)
                .required()
                .messages({
                    'string.min': 'Address must be at least 3 characters',
                    'string.max': 'Address cannot exceed 100 characters',
                    'string.empty': 'Address is required',
                    'any.required': 'Address is required',
                })

        })
    },


    refreshToken: {
        body: Joi.object({
            refreshToken: Joi.string().required().messages({
                'any.required': 'Refresh token is required'
            })
        })
    }


}

module.exports = authValidators;