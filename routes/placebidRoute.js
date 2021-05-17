const express = require('express');
const { createplaceBid, getTotalplacebid, getAllplacebid } = require('../controllers/placeBidController');
const { protected } = require('../controllers/authController');
const router = express.Router();

router.route('/').get(protected, getAllplacebid).post(protected, createplaceBid);
router.route('/products/:productId').get(protected, getTotalplacebid);

module.exports = router;
