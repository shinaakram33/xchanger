const express = require('express');
const dummyRoute = require('./dummyRoute');
const userRoute = require('./userRoute');
const categoryRoute = require('./categoriesRoute');
const brandRoute = require('./brandRoute');
const wishlistRoute = require('./wishlistRoute');

const router = express.Router();

router.use('/dummy', dummyRoute);
router.use('/users', userRoute);
router.use('/categories', categoryRoute);
router.use('/brands', brandRoute);
router.use('/wishlist', wishlistRoute);

module.exports = router;
