const jwt = require("jsonwebtoken");
const { redisHelper } = require("../config/redis");
const userModel = require("../models/user.model");
const { generateRefreshToken, generateAccessToken } = require("../services/jwt.service");
const twilioService = require("../services/twilio.service");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../utils/logger");
const config = require("../config/env");

class AuthController {

    // Send OTP for Login
    sendOTP = asyncHandler(async (req, res) => {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            throw new ApiError(400, 'Phone number is required');
        }

        await twilioService.sendLoginOTP(phoneNumber);
        logger.info(`OTP sent to ${phoneNumber}`);

        res.status(200).json(
            new ApiResponse(200, null, 'OTP sent successfully to your phone')
        );
    });

    // Verify OTP
    verifyOTP = asyncHandler(async (req, res) => {
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            throw new ApiError(400, 'Phone number and OTP are required');
        }

        await twilioService.verifyOTP(phoneNumber, otp);

        let user = await userModel.findOne({ phoneNumber });

        if (!user) {
            user = await userModel.create({
                phoneNumber,
                isPhoneVerified: true,
                isRegistrationComplete: false,
                lastLogin: new Date()
            });
        } else {
            user.isPhoneVerified = true;
            user.lastLogin = new Date();
            await user.save();
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await redisHelper.set(`refresh_token:app:${user._id}`,
            refreshToken,
            30 * 24 * 60 * 60
        );

        const sessionData = {
            userId: user._id.toString(),
            phoneNumber: user.phoneNumber,
            isRegistrationComplete: user.isRegistrationComplete,
            lastActivity: Date.now()
        };

        await redisHelper.set(
            `session:app:${user._id}`,
            sessionData,
            24 * 60 * 60
        );

        logger.info(`User logged in: ${phoneNumber}`);

        res.status(200).json(
            new ApiResponse(200, {
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    phoneNumber: user.phoneNumber,
                    name: user.name,
                    email: user.email,
                    role:user.role,
                    location: user.location,
                    isRegistrationComplete: user.isRegistrationComplete
                },
                needsRegistration: !user.isRegistrationComplete // Frontend checks this
            }, 'OTP verified successfully')
        );
    });

    //Resend OTP
    resendOTP = asyncHandler(async (req, res) => {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            throw new ApiError(400, 'Phone number is required');
        }

        await twilioService.resendOTP(phoneNumber);

        logger.info(`OTP resent to ${phoneNumber}`);

        res.status(200).json(
            new ApiResponse(200, null, 'OTP resent successfully')
        );

    });

    // Refresh Token
    refreshToken = asyncHandler(async (req, res) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new ApiError(401, 'Refresh token is requried');
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
        } catch (error) {
            throw new ApiError(401, 'Invalid or expired refresh token');
        }

        const storedToken = await redisHelper.get(`refresh_token:app:${decoded.userId}`);

        if (!storedToken || storedToken !== refreshToken) {
            throw new ApiError(401, 'Refresh token not found or revoked');
        }

        const user = await userModel.findById(decoded.userId);

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        const newRefreshToken = generateRefreshToken(user);
        const newAccessToken = generateAccessToken(user);

        await redisHelper.set(
            `refresh_token:app:${user._id}`,
            newRefreshToken,
            7 * 24 * 60 * 60
        );

        await redisHelper.set(
            `session:app:${user._id}`,
            {
                userId: user._id.toString(),
                phoneNumber: user.phoneNumber,
                isRegistrationComplete: user.isRegistrationComplete,
                lastActivity: Date.now()
            },
            24 * 60 * 60
        );

        res.status(200).json(
            new ApiResponse(
                200,
                {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken
                },
                'Token refreshed successfully'
            )
        );
    });

}


module.exports = new AuthController();