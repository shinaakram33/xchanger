const express = require('express');
const { createplaceBid, getTotalplacebid, getAllplacebid } = require('../controllers/placeBidController');
const { protected } = require('../controllers/authController');
const router = express.Router();

router.route('/').get(protected, getAllplacebid);
router.route('/products/:productId').get(protected, getTotalplacebid).post(protected, createplaceBid);

module.exports = router;
