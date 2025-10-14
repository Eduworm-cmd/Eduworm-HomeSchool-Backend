const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const config = require("../config/env");
const { redisHelper } = require("../config/redis");

const isLogin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new ApiError(401, 'Unauthorized access - No token provided'));
        }

        const token = authHeader.split(' ')[1];
        console.log("Token is Coming:", token);

        let decoded;
        try {
            decoded = jwt.verify(token, config.jwtSecret);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return next(new ApiError(401, 'Token expired - Please refresh'));
            }
            return next(new ApiError(401, 'Invalid Token Provided'));
        }

        const session = await redisHelper.get(`session:app:${decoded.userId}`);

        if (!session) {
            return next(new ApiError(401, 'Session expired - Please login again'));
        }

        session.lastActivity = Date.now();
        await redisHelper.set(`session:app:${decoded.userId}`, session, 24 * 60 * 60);

        req.user = {
            _id: decoded.userId,
            phoneNumber: decoded.phoneNumber
        };

        next();
    } catch (error) {
        return next(new ApiError(401, 'Authentication failed'));
    }
};

module.exports = isLogin;
