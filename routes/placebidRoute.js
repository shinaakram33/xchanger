const express = require('express');
const { createplaceBid, getTotalplacebid, getAllplacebid } = require('../controllers/placebidController');
const { protected } = require('../controllers/authController');
const router = express.Router();

router.route('/').post(protected, createplaceBid).get(protected, getAllplacebid);
router.route('/products/:productId').get(protected, getTotalplacebid);

module.exports = router;
