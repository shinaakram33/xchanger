const express = require('express');
const { getDummyData, createDummyData } = require('../controllers/dummyController');
const { protected } = require('../controllers/authController');
const router = express.Router();

router.route('/').get(protected, getDummyData).post(createDummyData);

module.exports = router;
