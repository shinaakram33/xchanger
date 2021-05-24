const express = require('express');
const { createplaceBid, getTotalplacebid, getAllplacebid, getAllplacebidOfSpecficProduct } = require('../controllers/placeBidController');
const { protected } = require('../controllers/authController');
const router = express.Router();

router.route('/').get(protected, getAllplacebid).post(protected, createplaceBid);
router.route('/products/:productId').get(protected, getTotalplacebid).post(protected,getAllplacebidOfSpecficProduct);

module.exports = router;
