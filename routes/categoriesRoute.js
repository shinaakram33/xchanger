const express = require('express');
const { createCategory, getAllCategories } = require('../controllers/categoryController');
const { protected, restrictTo } = require('../controllers/authController');
const ProductRouter = require('./productRoute');

const router = express.Router({ mergeParams: true });

router.use('/:categoryId/products', ProductRouter);

router.route('/').post(protected, restrictTo('admin'), createCategory).get(getAllCategories);

module.exports = router;
