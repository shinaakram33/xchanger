const express = require('express');
const {} = require('../controllers/categoryController');
const { protected, restrictTo } = require('../controllers/authController');
const router = express.Router({ mergeParams: true });

// router.route('/').post(protected, restrictTo('admin'), createCategory).get(getAllCategories);

module.exports = router;
