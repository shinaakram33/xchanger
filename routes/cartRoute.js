const express = require('express');
const { protected } = require('../controllers/authController');
const {
  createCart,
  getAllCartProducts,
  removeProductFromCart,
} = require('../controllers/CartController');

const router = express.Router();

router
  .route('/')
  .post(protected, createCart)
  .get(protected, getAllCartProducts)
  .put(protected, removeProductFromCart);

module.exports = router;
