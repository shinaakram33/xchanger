const express = require('express');

const { getUserProducts, updateWishlistStatus, updateRating } = require('../controllers/productController');
const { protected } = require('../controllers/authController');

const router = express.Router();

router.route('/users/:userId').get(protected, getUserProducts);
router.route('/wishlistStatus').put(protected, updateWishlistStatus);
router.route('/rating').put(protected, updateRating);

module.exports = router;
