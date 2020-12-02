const express = require('express');
const {createProduct, getAllProduct,updateproducts,deleteproducts} = require('../controllers/productController');
const { protected, restrictTo } = require('../controllers/authController');
const router = express.Router({ mergeParams: true });

 router.route('/').post(createProduct).get(getAllProduct);
 router.route('/:id').patch(updateproducts);
 router.route('/:id').delete(deleteproducts);



module.exports = router;
