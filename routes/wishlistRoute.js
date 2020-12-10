const express = require('express');
const {
  createWishList,
  getAllWishList,
  removeProductFromWishList,
} = require('../controllers/wishlistController');
const { protected } = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .post(protected, createWishList)
  .get(protected, getAllWishList)
  .put(protected, removeProductFromWishList);

// router.route('/:productId').post(protected, removeProductFromWishList);

module.exports = router;
