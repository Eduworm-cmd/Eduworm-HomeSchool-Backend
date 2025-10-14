const express = require('express');
const { authLimiter, apiLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate.middleware');
const adminValidators = require('../validators/admin.validator');
const adminController = require('../controllers/admin.controller');
const isAdmin = require('../middlewares/isAdmin');
const router = express.Router();


router.post('/login', authLimiter, validate(adminValidators.adminLogin), adminController.loginAdmin);

router.post('/refreshToken', apiLimiter, adminController.refreshToken);

router.post('/logout', isAdmin,apiLimiter, adminController.logoutAdmin);

module.exports = router;