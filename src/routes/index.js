const express = require("express");
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const adminRoutes = require('./admin.routes');
const ageGroupRoutes = require('./ageGroup.routes');
const subjectRoutes = require('./subjectKit.routes');
const quizGameRoutes = require('./quizGame.routes');
const teacherRoutes = require('./teacher.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);
router.use('/ageGroup', ageGroupRoutes);
router.use('/subjectKit', subjectRoutes);
router.use('/quizGame', quizGameRoutes);
router.use('/teacher', teacherRoutes);

router.get('/', (req, res) => {
  res.json({
    message: 'Student Admin API v1.0',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      user: '/api/v1/user'
    },
    availableRoutes: {
      'POST /api/v1/auth/send-otp': 'Send OTP to phone',
      'POST /api/v1/auth/verify-otp': 'Verify OTP and login',
      'POST /api/v1/auth/resend-otp': 'Resend OTP',
      'POST /api/v1/auth/refresh-token': 'Refresh access token',
      'POST /api/v1/admin/login': 'Admin Login',
      'POST /api/v1/admin/refreshToken': 'Admin refresh Token',
      'POST /api/v1/admin/logout': 'Admin Logut',
      'POST /api/v1/ageGroup/create': 'Age Group Create',
      'POST /api/v1/subjectKit/create': 'Subject Kit Create',
      'POST /api/v1/quizGame/create': 'Quiz Games Create',
      'POST /api/v1/quizGame/all': 'All Quiz Game',
    },
    documentation: '/api/v1/docs'
  });
});

module.exports = router;