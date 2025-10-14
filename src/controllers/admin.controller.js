const jwt = require('jsonwebtoken');
const { redisHelper } = require("../config/redis");
const adminModel = require("../models/admin.model");
const { generateAccessToken, generateRefreshToken } = require("../services/jwt.service");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const config = require('../config/env');
const logger = require('../utils/logger');

class AdminController {

    loginAdmin = asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ApiError(400, 'Email and Password are required');
        }

        const admin = await adminModel.findOne({ email }).select('+password');

        if (!admin) {
            throw new ApiError(401, 'Invalid credentials');
        }

        const isPasswordValid = await admin.comparePassword(password);

        if (!isPasswordValid) {
            throw new ApiError(401, 'Invalid credentials');
        }

        await redisHelper.del(`admin_session:${admin._id}`);
        await redisHelper.del(`admin_refresh_token:${admin._id}`);

        const accessToken = generateAccessToken(admin);
        const refreshToken = generateRefreshToken(admin);

        await redisHelper.set(
            `admin_refresh_token:${admin._id}`,
            refreshToken,
            30 * 24 * 60 * 60
        );

        const sessionData = {
            adminId: admin._id.toString(),
            email: admin.email,
            role: admin.role,
            lastActivity: Date.now()
        };

        await redisHelper.set(
            `admin_session:${admin._id}`,
            sessionData,
            24 * 60 * 60
        );

        admin.lastLogin = new Date();
        await admin.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });


        res.status(200).json(
            new ApiResponse(200, {
                accessToken,
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
                }
            }, 'Login Successfully')
        );
    });


    refreshToken = asyncHandler(async (req, res) => {
        const refreshToken = req.cookies.refreshToken;        

        if (!refreshToken) {
            throw new ApiError(400, 'Refresh token is required');
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
        } catch (error) {
            throw new ApiError(401, 'Invalid or expired refresh token');
        }

        const storedToken = await redisHelper.get(`admin_refresh_token:${decoded.userId}`);

        if (!storedToken || storedToken !== refreshToken) {
            throw new ApiError(401, 'Refresh token not found or invalid');
        }

        const session = await redisHelper.get(`admin_session:${decoded.userId}`);

        if (!session) {
            throw new ApiError(401, 'Session expired - Please login again');
        }

        const admin = await adminModel.findById(decoded.userId);

        
        if (!admin) {
            throw new ApiError(404, 'Admin not found');
        }

        const newAccessToken = generateAccessToken(admin);

        session.lastActivity = Date.now();
        await redisHelper.set(`admin_session:${admin._id}`, session, 24 * 60 * 60);

        logger.info(`Access token refreshed for admin: ${admin.email}`);

        res.status(200).json(
            new ApiResponse(200, {
                admin,
                accessToken: newAccessToken
            }, 'Token refreshed successfully')
        );
    });

    logoutAdmin = asyncHandler(async (req, res) => {
        
        const adminId = req.admin._id;

        await redisHelper.del(`admin_refresh_token:${adminId}`);
        await redisHelper.del(`admin_session:${adminId}`);

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: config.nodeEnv === 'production',
            sameSite: 'Strict'
        });

        res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
    });
}

module.exports = new AdminController();