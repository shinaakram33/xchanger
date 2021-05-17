const express = require('express');
const { createOrder, getAllOrders } = require('../controllers/orderController');
const { protected } = require('../controllers/authController');
const router = express.Router();

router.route('/cart/:cartId').post(protected, createOrder);
router.route('/').get(protected, getAllOrders);

module.exports = router;
