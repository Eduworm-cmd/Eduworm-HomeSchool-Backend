const twilio = require('twilio');
const config = require('../config/env');
const { redisHelper } = require('../config/redis');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

const twilioClient = twilio(config.twilioAccountSid, config.twilioAuthToken);

class TwilioService {
  // Generate OTP
  generateOTP(length = 4) {
    return Math.floor(100000 + Math.random() * 900000).toString().substring(0, length);
  }

  // Send OTP via SMS using Twilio
  async sendOTP(phoneNumber, otp) {
    try {
      const message = await twilioClient.messages.create({
        body: `Your verification code is: ${otp}. Valid for 5 minutes.`,
        from: config.twilioPhoneNumber,
        to: phoneNumber
      });

      logger.info(`OTP sent to ${phoneNumber}: ${message.sid}`);
      return { success: true, messageSid: message.sid };
    } catch (error) {
      logger.error('Twilio send OTP error:', error);
      throw new ApiError(500, 'Failed to send OTP');
    }
  }

  // Send OTP using Twilio Verify API (Recommended)
  async sendOTPVerify(phoneNumber) {
    try {
      const verification = await twilioClient.verify.v2
        .services(config.twilioVerifyServiceSid)
        .verifications.create({ to: phoneNumber, channel: 'sms' });

      logger.info(`OTP sent via Verify API to ${phoneNumber}: ${verification.sid}`);
      return { success: true, verificationSid: verification.sid };
    } catch (error) {
      logger.error('Twilio Verify send OTP error:', error);
      throw new ApiError(500, 'Failed to send OTP');
    }
  }

  // Verify OTP using Twilio Verify API
  async verifyOTPVerify(phoneNumber, code) {
    try {
      const verificationCheck = await twilioClient.verify.v2
        .services(config.twilioVerifyServiceSid)
        .verificationChecks.create({ to: phoneNumber, code });

      return verificationCheck.status === 'approved';
    } catch (error) {
      logger.error('Twilio Verify check OTP error:', error);
      return false;
    }
  }

  // Store OTP in Redis
  async storeOTP(phoneNumber, otp) {
    console.log("Hera We save otp in redis :",otp);
    
    const key = `otp:${phoneNumber}`;
    const data = {
      otp,
      createdAt: Date.now(),
      attempts: 0
    };
    
    await redisHelper.set(key, data, config.otpExpiry || 300);
    return true;
  }

  // Verify OTP from Redis
  async verifyOTP(phoneNumber, otp) {
    const key = `otp:${phoneNumber}`;

    const data = await redisHelper.get(key);    

    if (!data) {
      throw new ApiError(400, 'OTP expired or invalid');
    }

    if (data.attempts >= 3) {
      await redisHelper.del(key);
      throw new ApiError(429, 'Too many attempts. Please request a new OTP');
    }

    if (data.otp !== otp) {
      data.attempts += 1;
      await redisHelper.set(key, data, config.otpExpiry || 300);
      throw new ApiError(400, 'Invalid OTP');
    }

    await redisHelper.del(key);
    return true;
  }

  // Send OTP for login
  async sendLoginOTP(phoneNumber) {
    const rateLimitKey = `otp:ratelimit:${phoneNumber}`;
    const attempts = await redisHelper.get(rateLimitKey);

    if (attempts && attempts >= 5) {
      throw new ApiError(429, 'Too many OTP requests. Please try again after 15 minutes');
    }

    const otp = this.generateOTP();

    console.log("Main Genrated OTP",otp);
    
    await this.sendOTP(phoneNumber, otp);
    await this.storeOTP(phoneNumber, otp);

    const newAttempts = (attempts || 0) + 1;
    await redisHelper.set(rateLimitKey, newAttempts, 900); 

    return { success: true, message: 'OTP sent successfully' };
  }

  async resendOTP(phoneNumber) {
    const key = `otp:${phoneNumber}`;
    const existingOTP = await redisHelper.get(key);

    if (existingOTP) {
      const timeSinceCreation = Date.now() - existingOTP.createdAt;
      if (timeSinceCreation < 60000) {
        throw new ApiError(400, 'Please wait 1 minute before requesting a new OTP');
      }
    }

    return await this.sendLoginOTP(phoneNumber);
  }
}

module.exports = new TwilioService();