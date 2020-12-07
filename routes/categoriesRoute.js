const express = require('express');
const { createCategory, getAllCategories, updatecategory, deletecategory } = require('../controllers/categoryController');
const { protected, restrictTo } = require('../controllers/authController');
const ProductRouter = require('./productRoute');

const router = express.Router({ mergeParams: true });

router.use('/:categoryId/products', ProductRouter);

router.route('/').post(protected, restrictTo('admin'), createCategory).get(getAllCategories);

router.route('/:categoryId').patch(protected, restrictTo('admin'), updatecategory).delete(deletecategory);

module.exports = router;
