const { redisHelper } = require("../config/redis");
const userModel = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../utils/logger");

class UserController {
    resgisterationUser = asyncHandler(async (req, res) => {
        const { name, email, location } = req.body;

        const userId = req.user._id;

        const user = await userModel.findById(userId);

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        if (user.isRegistrationComplete) {
            throw new ApiError(400, 'Registration already completed');
        }

        user.name = name;
        user.email = email;
        user.location = location;
        user.isRegistrationComplete = true;

        await user.save();

        await redisHelper.set(
            `session:${user._id}`,
            {
                userId: user._id,
                phoneNumber: user.phoneNumber,
                isRegistrationComplete: true,
                lastActivity: Date.now()
            },
            24 * 60 * 60
        );

        await redisHelper.set(
            `user:${user._id}`,
            user.toObject(),
            3600
        );

        logger.info(`Registration completed for: ${user.phoneNumber}`);

        res.status(200).json(
            new ApiResponse(200, {
                user: {
                    id: user._id,
                    name: user.name,
                    phoneNumber: user.phoneNumber,
                    email: user.email,
                    location: user.location,
                    isRegistrationComplete: user.isRegistrationComplete
                }
            }, 'Registration completed successfully')
        );
    });
}


module.exports = new UserController();