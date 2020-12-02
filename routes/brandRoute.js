const express = require('express');
const { createBrand } = require('../controllers/brandController');
const { protected, restrictTo } = require('../controllers/authController');
const router = express.Router();

router.route('/').post(protected, restrictTo('admin'), createBrand);

module.exports = router;
