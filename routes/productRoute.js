const express = require('express');
const {
  createProduct,
  getAllProduct,
  updateProducts,
  deleteProducts,
  getUserProducts,
  getAllPendingPosts,
  updateStatus,
} = require('../controllers/productController');
const { protected, restrictTo } = require('../controllers/authController');
const { route } = require('./dummyRoute');

const router = express.Router({ mergeParams: true });

router.route('/').post(protected, createProduct);
router.route('/status/:statusId').get(getAllPendingPosts);
router.route('/all').get(getAllProduct);
router
  .route('/:productId')
  .patch(protected, updateProducts)
  .delete(protected, deleteProducts)
  .put(protected, restrictTo('admin'), updateStatus);

router.route('/users/:userId').get(protected, getUserProducts);

module.exports = router;
