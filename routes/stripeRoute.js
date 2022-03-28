const express = require('express');
const { protected } = require('../controllers/authController');
const { createNewAccount, updateAccount } = require('../controllers/stripeController');

const router = express.Router();

router.route('/refresh').get(function(req, res) {
    return res.send('You refreshed');
});

router.route('/return').get(function(req, res) {
    return res.send('Return url');
});

router.route('/createConnectAccount').get(protected, createNewAccount);
router.route('/updateConnectAccount/:accountId').get(protected, updateAccount);

module.exports = router;