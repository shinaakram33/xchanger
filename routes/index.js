const express = require('express');
const router = express.Router();
const dummyRoute = require('./dummyRoute');
const userRoute = require('./userRoute');
const categoryRoute = require('./categoriesRoute');

router.use('/dummy', dummyRoute);
router.use('/users', userRoute);
router.use('/categories', categoryRoute);

module.exports = router;
