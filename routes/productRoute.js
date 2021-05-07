const express = require('express');
const {
  createProduct,
  getAllProduct,
  updateProducts,
  deleteProducts,
  createBiddingProduct,
  getCategoryProduct,
  getCategoryFilteredProduct,
  getBiddingPendingProduct,
  getSpecificProductDetail,
} = require('../controllers/productController');
const { protected, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.route('/').post(protected, createProduct).get(getCategoryProduct);
router.route('/bidding').post(protected, createBiddingProduct);
router.route('/filtered').get(getCategoryFilteredProduct);
router.route('/all').get(getAllProduct);
router.route('/pending').get(protected, restrictTo('admin'), getBiddingPendingProduct);
router.route('/:productId').patch(protected, updateProducts).delete(protected, deleteProducts).get(getSpecificProductDetail);

module.exports = router;
