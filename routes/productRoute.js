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
  changeBiddingStatus,
  getBiddingProducts,
  scheduleAndAddToCart,
  updateWishlistStatus,
  getRandomProducts,
  getProductByTitle
} = require('../controllers/productController');
const { protected, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.route('/').post(protected, createProduct).get(getCategoryProduct);
router.route('/bidding').post(protected, createBiddingProduct).get(getBiddingProducts);
router.route('/filtered').get(getCategoryFilteredProduct);
router.route('/all').get(getAllProduct);
router.route('/recomended').get(getRandomProducts);
router.route('/:title').get(getProductByTitle);
router.route('/pending').get(protected, restrictTo('admin'), getBiddingPendingProduct);
router.route('/wishlistStatus').put(updateWishlistStatus)
router
  .route('/:productId')
  .patch(protected, updateProducts)
  .delete(protected, deleteProducts)
  .get(getSpecificProductDetail)
  .put(protected, restrictTo('admin'), changeBiddingStatus)
  .post(protected, scheduleAndAddToCart)

module.exports = router;
