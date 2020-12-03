const express = require('express');
const { createWishList, getAllWishList } = require('../controllers/wishlistController');
const { protected } = require('../controllers/authController');

const router = express.Router();

router.route('/').post(protected, createWishList).get(protected, getAllWishList);

module.exports = router;
