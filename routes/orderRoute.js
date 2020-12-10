const express = require('express');
const { createOrder } = require('../controllers/orderController');
const { protected } = require('../controllers/authController');
const router = express.Router();

router.route('/cart/:cartId').post(protected, createOrder);

module.exports = router;
