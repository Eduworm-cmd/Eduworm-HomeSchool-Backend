const rateLimit = require("express-rate-limit");
const ApiError = require("../utils/ApiError");

const createRateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    return rateLimit({
        windowMs, 
        max: maxRequests, 
        message: 'Too many requests from this IP, please try again later.',
        handler: (req, res, next) => {
            throw new ApiError(429, 'Too many requests, please try again later.');
        },
        standardHeaders: true, 
        legacyHeaders: false,
    });
};

// Auth 5 requests per 15 minutes
const authLimiter = createRateLimiter(5, 15 * 60 * 1000);

// General API 100 requests per 15 minutes
const apiLimiter = createRateLimiter(100, 15 * 60 * 1000);

module.exports = {
    authLimiter,
    apiLimiter,
    createRateLimiter,
};
