const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const config = require("../config/env");
const { redisHelper } = require("../config/redis");

const isAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.cookies.accessToken;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new ApiError(401, 'Unauthorized - No token provided'));
        }

        const token = authHeader.split(' ')[1];

        
        let decoded;

        try {
            decoded = jwt.verify(token, config.jwtSecret);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return next(new ApiError(401, 'Token expired - Please refresh token'));
            }
            return next(new ApiError(401, 'Invalid token'));
        }

        const session = await redisHelper.get(`admin_session:${decoded.userId}`);
        
        if (!session) {
            return next(new ApiError(401, 'Session expired - Please login again'));
        }

        const sessionAge = Date.now() - session.lastActivity;
        const maxSessionAge = 24 * 60 * 60 * 1000;


        if (sessionAge > maxSessionAge) {
            await redisHelper.del(`admin_session:${decoded.userId}`);
            return next(new ApiError(401, 'Session expired due to inactivity'));
        }

        session.lastActivity = Date.now();
        await redisHelper.set(`admin_session:${decoded.userId}`, session, 24 * 60 * 60);

        req.admin = {
            _id: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        return next(new ApiError(401, 'Authentication failed'))
    }
}

module.exports = isAdmin;