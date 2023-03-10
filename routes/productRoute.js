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
  getProductByTitle,
  getFeaturedPosts,
  createFeaturedProduct
} = require('../controllers/productController');
const { protected, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });


router.route('/featured/:productId').post(protected, createFeaturedProduct);
router.route('/featured').get(protected, getFeaturedPosts);
router.route('/').post(protected, createProduct);
router.route('/').get(getCategoryProduct);
router.route('/bidding').post(protected, createBiddingProduct).get(getBiddingProducts);
router.route('/filtered').get(getCategoryFilteredProduct);
router.route('/all').get(getAllProduct);
router.route('/recomended').get(getRandomProducts);
router.route('/:title').get(getProductByTitle);
router.route('/pending').get(getBiddingPendingProduct);
router.route('/wishlistStatus').put(updateWishlistStatus)
router.route('/product/:productId').get(getSpecificProductDetail),
router
  .route('/:productId')
  .patch(protected, updateProducts)
  .delete(protected, deleteProducts)
  .put(protected, restrictTo('admin'), changeBiddingStatus)
  .post(protected, scheduleAndAddToCart)

module.exports = router;
