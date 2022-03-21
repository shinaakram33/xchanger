const express = require('express');
const { createNewAccount, updateAccount } = require('../controllers/stripeController');

const router = express.Router();

router.route('/refresh').get(function(req, res) {
    return res.send('You refreshed');
});

router.route('/return').get(function(req, res) {
    return res.send('Return url');
});

router.route('/createConnectAccount').get(createNewAccount);
router.route('/updateConnectAccount/:accountId').get(updateAccount);

module.exports = router;