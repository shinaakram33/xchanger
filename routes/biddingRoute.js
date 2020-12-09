const express = require('express');
const { createBidding, getAllbidding } = require('../controllers/biddingController');
const { protected, restrictTo } = require('../controllers/authController');
const router = express.Router();

router.route('/user/:userid').post(protected, createBidding).get();
router.route('/').get(protected, getAllbidding);

module.exports = router;
