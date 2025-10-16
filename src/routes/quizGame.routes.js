const express = require('express');
const isAdmin = require('../middlewares/isAdmin');
const multer = require('multer');
const validate = require('../middlewares/validate.middleware');
const createQuizGameValidator = require('../validators/quizGame.validator');
const quizGameController = require('../controllers/quizGame.controller');
const isLogin = require('../middlewares/isLogin.middleware');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/create',
  isAdmin,
  upload.fields([{ name: 'options', maxCount: 4 }]),
  validate(createQuizGameValidator),
  quizGameController.create
);

router.get('/all',quizGameController.getAll);

module.exports = router;
