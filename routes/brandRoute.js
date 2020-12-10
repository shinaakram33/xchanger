const express = require('express');
const {
  createBrand,
  getAllBrands,
  updateBrand,
  deletebrand,
} = require('../controllers/brandController');
const { protected, restrictTo } = require('../controllers/authController');
const router = express.Router();

router.route('/').post(protected, restrictTo('admin'), createBrand).get(getAllBrands);
router.route('/:brandId').patch(protected, restrictTo('admin'), updateBrand).delete(deletebrand);

module.exports = router;
