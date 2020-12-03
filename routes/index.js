const express = require('express');
const router = express.Router();
const dummyRoute = require('./dummyRoute');
const userRoute = require('./userRoute');
const categoryRoute = require('./categoriesRoute');
// const brandRoute = require('./brandRoute');

router.use('/dummy', dummyRoute);
router.use('/users', userRoute);
router.use('/categories', categoryRoute);
// router.use('/brands', brandRoute);

module.exports = router;
