const jwt = require("jsonwebtoken");
const config = require("../config/env");

// Generate Access Token
const generateAccessToken = (user) => {
    const payload = {
        userId: user._id,
        type: 'access'
    };

    if (user.role === 'User') {
        payload.phoneNumber = user.phoneNumber;
        payload.role = user.role;
        payload.isRegistrationComplete = user.isRegistrationComplete;
    } else {
        payload.email = user.email;
        payload.role = user.role;
    }
    return jwt.sign(
        payload,
        config.jwtSecret,
        { expiresIn: config.jwtExpire }
    );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
    const payload = {
        userId: user._id,
        type: 'refresh'
    };

    if (user.role === 'User') {
        payload.phoneNumber = user.phoneNumber;
        payload.role = user.role;
    } else {
        payload.email = user.email;
        payload.role = user.role;
    }
    return jwt.sign(
        payload,
        config.jwtRefreshSecret,
        { expiresIn: config.jwtRefreshExpire }
    );
};

const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, config.jwtSecret);
    } catch (error) {
        throw error;
    }
}

const verifyRefreshToken = (token) =>{
    try {
        return jwt.verify(token,config.jwtRefreshSecret);
    } catch (error) {
        throw error;
    }
}

module.exports = { generateAccessToken, generateRefreshToken,verifyAccessToken ,verifyRefreshToken};
