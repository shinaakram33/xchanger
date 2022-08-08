const express = require('express');
const { protected } = require('../controllers/authController');
const {
  createCart,
  getAllCartProducts,
  removeProductFromCart,
  selectedProductFromCart,
  getSelectedProductFromCart,
  createAnotherCart,
} = require('../controllers/CartController');

const router = express.Router();

router.route('/anotherCart').post( createAnotherCart)
router
  .route('/')
  .post(protected, createCart)
  .get(protected, getAllCartProducts)
  .put(protected, removeProductFromCart);

router
  .route('/:cartId')
  .post(protected, selectedProductFromCart)
  .get(protected, getSelectedProductFromCart);

module.exports = router;
