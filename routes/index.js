const express = require('express');
const dummyRoute = require('./dummyRoute');
const userRoute = require('./userRoute');
const categoryRoute = require('./categoriesRoute');
const userProductRoute = require('./userProductsRoute');
const brandRoute = require('./brandRoute');
const wishlistRoute = require('./wishlistRoute');
const recentViewRoute = require('./recentViewRoute');
const cartRoute = require('./cartRoute');
const orderRoute = require('./orderRoute');
const filterRoute = require('./filterRoute');
const uploadFileRoute = require('./uploadFile');

const router = express.Router();
const biddingRoute = require('./biddingRoute');

router.use('/dummy', dummyRoute);
router.use('/users', userRoute);
router.use('/categories', categoryRoute);
router.use('/products', userProductRoute);
router.use('/brands', brandRoute);
router.use('/wishlist', wishlistRoute);
router.use('/recentViews', recentViewRoute);
router.use('/cart', cartRoute);
router.use('/order', orderRoute);
router.use('/bidding', biddingRoute);
router.use('/filter', filterRoute);
router.use('/uploadFile', uploadFileRoute);
// router.use('/placeBid', placebidRoute);

module.exports = router;
