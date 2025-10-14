const express = require('express');
const router = express.Router();

const { authLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate.middleware');
const authValidators = require('../validators/auth.validator');
const authController = require('../controllers/auth.controller');

router.post(
  '/send-otp',
  authLimiter,
  validate(authValidators.sendOTP),
  authController.sendOTP
);

router.post('/verify-otp',validate(authValidators.verifyOTP), authController.verifyOTP);

router.post('/resend-otp', authLimiter, validate(authValidators.sendOTP), authController.resendOTP);

router.post('/refresh-token', authLimiter, validate(authValidators.refreshToken), authController.refreshToken);



module.exports = router;