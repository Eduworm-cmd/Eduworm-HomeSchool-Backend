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
  upload.fields([{ name: 'subjectKitImage', maxCount: 1 },]),
  validate(createSubjectKitValidator),
  subjectKitController.create
);
router.get('/all', subjectKitController.getAll);
router.get('/dropdown/:ageGroup', subjectKitController.dropdownByAgeGroup);
router.get('/dropdown', subjectKitController.dropdown);

module.exports = router;
