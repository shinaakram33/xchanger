const express = require('express');
const { createSubCategoryOptions, getSubCategoryOptions, updateSubCategoryOptions, deleteSubCategoryOptions } = require('../controllers/subCategoryOptionsController');
const { protected, restrictTo } = require('../controllers/authController');
const ProductRouter = require('./productRoute');

const router = express.Router({ mergeParams: true });

router.use('/:subCategoryOptionId/products', ProductRouter);

router.route('/').post(protected, restrictTo('admin'), createSubCategoryOptions).get(getSubCategoryOptions);

router.route('/:subCategoryOptionId').patch(protected, restrictTo('admin'), updateSubCategoryOptions).delete(protected, restrictTo('admin'), deleteSubCategoryOptions);

module.exports = router;
