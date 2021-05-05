const express = require('express');
const { createCategory, getAllCategories, updatecategory, deletecategory } = require('../controllers/categoryController');
const { protected, restrictTo } = require('../controllers/authController');
const SubCategoryRoute = require('./subCategoryRoute');
const ProductRoute = require('./productRoute');

const router = express.Router({ mergeParams: true });

router.use('/:categoryId/subCategory', SubCategoryRoute);
router.use('/:categoryId/products', ProductRoute);

router.route('/').post(protected, restrictTo('admin'), createCategory).get(getAllCategories);

router.route('/:categoryId').patch(protected, restrictTo('admin'), updatecategory).delete(deletecategory);

module.exports = router;
