const express = require('express');
const {
  createProduct,
  getAllProduct,
  updateProducts,
  deleteProducts,
} = require('../controllers/productController');
const { protected, restrictTo } = require('../controllers/authController');
const router = express.Router({ mergeParams: true });

router.route('/').post(protected, createProduct).get(getAllProduct);
router.route('/:productId').patch(protected, updateProducts).delete(deleteProducts);

module.exports = router;
