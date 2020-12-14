const express = require('express');
const {
  createBidding,
  getAllbidding,
  getuserbidding,
  updatebidding,
  deletebidding,
  updateByAdmin,
  getAllPostedstatus,
} = require('../controllers/biddingController');
const { protected, restrictTo } = require('../controllers/authController');
const router = express.Router();

router.route('/users/:userId').get(protected, getuserbidding);
router.route('/').get(protected, getAllbidding).post(protected, createBidding);
router.route('/:biddingid').patch(protected, updatebidding).delete(protected, deletebidding);
router.route('/product/:productId').put(protected, restrictTo('admin'), updateByAdmin);
router.route('/category/:categoryId/status/:statusId').get(protected, getAllPostedstatus);
module.exports = router;
