const express = require('express');
const router = express.Router();
const subjectKitController = require('../controllers/subjectKit.controller');
const validate = require('../middlewares/validate.middleware');
const multer = require('multer');
const createSubjectKitValidator = require('../validators/subjectKit.validator');
const isAdmin = require('../middlewares/isAdmin');
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/create',
  isAdmin,
  upload.fields([{ name: 'thumbnail', maxCount: 1 },]),
  validate(createSubjectKitValidator),
  subjectKitController.create
);

module.exports = router;
