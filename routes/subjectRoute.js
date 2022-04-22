const express = require('express');
const { createSubject, getSubjects, updateSubject, deleteSubject, getSubjectsBySubCategory } = require('../controllers/subjectController');
const { protected, restrictTo } = require('../controllers/authController');
const router = express.Router();

router.route('/').post(protected, restrictTo('admin'), createSubject).get(getSubjects);
router.route('/:subjectId').patch(protected, restrictTo('admin'), updateSubject).delete(deleteSubject);
router.route('/:subCategoryId').get(getSubjectsBySubCategory);

module.exports = router;
