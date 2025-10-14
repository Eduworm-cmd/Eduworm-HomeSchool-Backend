const express = require('express');
const validate = require('../middlewares/validate.middleware');
const createAgeGroupValidator = require('../validators/ageGroup.validator');
const ageGroupController = require('../controllers/ageGroup.controller');
const isAdmin = require('../middlewares/isAdmin');
const router = express.Router();

router.post('/create', isAdmin,validate(createAgeGroupValidator),ageGroupController.createAgeGroup);
router.get('/all', ageGroupController.getAllAgeGroup);






module.exports = router;