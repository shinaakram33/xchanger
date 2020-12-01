const express = require('express');
const { getDummyData, createDummyData } = require('../controllers/dummyController');
const { protected, restrictTo } = require('../controllers/authController');
const router = express.Router();

router.route('/').get(protected, restrictTo('admin'), getDummyData).post(createDummyData);

module.exports = router;
