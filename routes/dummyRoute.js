const express = require('express');
const { getDummyData, createDummyData, updateDummyData } = require('../controllers/dummyController');
const { protected, restrictTo } = require('../controllers/authController');
const router = express.Router();

router.route('/').get(getDummyData).post(createDummyData);
router.route('/id/:proId').put(updateDummyData)
module.exports = router;
