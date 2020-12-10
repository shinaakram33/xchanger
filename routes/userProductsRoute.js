const express = require('express');

const { getUserProducts } = require('../controllers/productController');
const { protected } = require('../controllers/authController');

const router = express.Router();

router.route('/users/:userId').get(protected, getUserProducts);

module.exports = router;
