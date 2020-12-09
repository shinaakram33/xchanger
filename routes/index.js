const express = require('express');
const router = express.Router();
const dummyRoute = require('./dummyRoute');
const userRoute = require('./userRoute');
const categoryRoute = require('./categoriesRoute');
const brandRoute = require('./brandRoute');
const biddingRoute = require('./biddingRoute');

router.use('/dummy', dummyRoute);
router.use('/users', userRoute);
router.use('/categories', categoryRoute);
router.use('/brands', brandRoute);
router.use('/bidding', biddingRoute);

module.exports = router;
