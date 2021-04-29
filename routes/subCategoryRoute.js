const express = require('express');
const { createSubCategory, getSubCategory, updateSubCategory, deleteSubCategory } = require('../controllers/subCategoryController');
const { protected, restrictTo } = require('../controllers/authController');
const SubCategoryOptionRoute = require('./subCategoryOptionRoute');

const router = express.Router({ mergeParams: true });

router.use('/:subCategoryId/subCategoryOptions', SubCategoryOptionRoute);

router.route('/').post(protected, restrictTo('admin'), createSubCategory).get(getSubCategory);

router.route('/:subCategoryId').patch(protected, restrictTo('admin'), updateSubCategory).delete(deleteSubCategory);

module.exports = router;
