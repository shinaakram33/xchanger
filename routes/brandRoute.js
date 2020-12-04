const express = require('express');
const { createBrand, getAllBrands } = require('../controllers/brandController');
const { protected, restrictTo } = require('../controllers/authController');
const router = express.Router();

router.route('/').post(protected, restrictTo('admin'), createBrand).get(getAllBrands);

module.exports = router;
