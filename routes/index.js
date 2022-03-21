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
const placeBidRoute = require('./placebidRoute');
const biddingRoute = require('./biddingRoute');
const productRoute = require('./productRoute');
const subjectRoute = require('./subjectRoute');
const featureAdRoute = require('./featureAdRoute');
const subCategoryOptionsRoute = require('./subCategoryOptionRoute');
const notificationRoute = require('./notificationRoute');
const chatRoute = require('./chatRoute')
const termConditionsRoute = require('./term-conditionsRoute');
const stripeRoute = require('./stripeRoute');

const router = express.Router();

router.use('/dummy', dummyRoute);
router.use('/products', productRoute);
router.use('/users', userRoute);
router.use('/categories', categoryRoute);
router.use('/products', userProductRoute);
router.use('/brands', brandRoute);
router.use('/subjects', subjectRoute);
router.use('/wishlist', wishlistRoute);
router.use('/recentViews', recentViewRoute);
router.use('/cart', cartRoute);
router.use('/order', orderRoute);
router.use('/bidding', biddingRoute);
router.use('/filter', filterRoute);
router.use('/uploadFile', uploadFileRoute);
router.use('/placeBid', placeBidRoute);
router.use('/featureAd', featureAdRoute);
router.use('/subCategoryOptions', subCategoryOptionsRoute);
router.use('/notification', notificationRoute);
router.use('/chats', chatRoute);
router.use('/t&c', termConditionsRoute);
router.use('/stripe', stripeRoute);

module.exports = router;
