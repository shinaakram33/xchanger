const express = require('express');
const { protected } = require('../controllers/authController');
const { createNewAccount, getAccountLink, completeAccount } = require('../controllers/stripeController');

const router = express.Router();

router.route('/refresh').get(function(req, res) {
    return res.send('You refreshed');
});

router.route('/createConnectAccount').get(protected, createNewAccount);
router.route('/getAccountLink').get(protected, getAccountLink);
router.route('/return/:accountId').get(completeAccount);

module.exports = router;