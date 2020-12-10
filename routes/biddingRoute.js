const express = require('express');
const { createBidding, getAllbidding, getuserbidding, updatebidding, deletebidding } = require('../controllers/biddingController');
const { protected, restrictTo } = require('../controllers/authController');
const router = express.Router();

router.route('/users/:userId').get(protected, getuserbidding);
router.route('/').get(protected, getAllbidding).post(protected, createBidding);
router.route('/:biddingid').patch(protected, updatebidding).delete(protected, deletebidding);

module.exports = router;
