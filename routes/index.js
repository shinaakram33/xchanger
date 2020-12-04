const express = require('express');
const dummyRoute = require('./dummyRoute');
const userRoute = require('./userRoute');
const categoryRoute = require('./categoriesRoute');
const brandRoute = require('./brandRoute');
const wishlistRoute = require('./wishlistRoute');
const recentViewRoute = require('./recentViewRoute');
const cartRoute = require('./cartRoute');

const router = express.Router();

router.use('/dummy', dummyRoute);
router.use('/users', userRoute);
router.use('/categories', categoryRoute);
router.use('/brands', brandRoute);
router.use('/wishlist', wishlistRoute);
router.use('/recentViews', recentViewRoute);
router.use('/cart', cartRoute);

module.exports = router;
