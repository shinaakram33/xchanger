const express = require('express');
const {
  createProduct,
  getAllProduct,
  updateProducts,
  deleteProducts,
  getUserProducts,
  getCategoryProduct,
  getAllPendingPosts,
  updateStatus,
  getCategoryFilteredProduct,
} = require('../controllers/productController');
const { protected, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.route('/').post(protected, createProduct).get(getCategoryProduct);
router.route('/filtered').get(getCategoryFilteredProduct);
router.route('/status/:statusId').get(getAllPendingPosts);
router.route('/all').get(getAllProduct);
router.route('/:productId').patch(protected, updateProducts).delete(protected, deleteProducts).put(protected, restrictTo('admin'), updateStatus);

module.exports = router;
