const express = require('express');
const { getDummyData, createDummyData } = require('../controllers/dummyController');
const { createCategory, getAllCategories } = require('../controllers/categoryController');
const { protected, restrictTo } = require('../controllers/authController');
const router = express.Router();

router.route('/').post(protected, restrictTo('admin'), createCategory).get(getAllCategories);

module.exports = router;
