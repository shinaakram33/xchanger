const express = require('express');
const router = express.Router();
const dummyRoute = require('./dummyRoute');
const userRoute = require('./userRoute');

router.use('/dummy', dummyRoute);
router.use('/users', userRoute);

module.exports = router;
