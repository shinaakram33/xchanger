const express = require('express');
const { getDummyData, createDummyData } = require('../controllers/dummyController');

const router = express.Router();

router.route('/').get(getDummyData).post(createDummyData);

module.exports = router;
