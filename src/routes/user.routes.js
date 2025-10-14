const express = require('express');
const { authLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate.middleware');
const authValidators = require('../validators/auth.validator');
const userContoller = require('../controllers/user.contoller');
const isLogin = require('../middlewares/isLogin.middleware');
const router = express.Router();

router.post(
    '/registration',
    isLogin,
    authLimiter,
    validate(authValidators.completeRegistration),
    userContoller.resgisterationUser
);

module.exports = router;