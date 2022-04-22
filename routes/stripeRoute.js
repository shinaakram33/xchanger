const express = require('express');
const { protected } = require('../controllers/authController');
const { createNewAccount, updateAccount, completeAccount } = require('../controllers/stripeController');

const router = express.Router();

router.route('/refresh').get(function(req, res) {
    return res.send('You refreshed');
});

// router.route('/return').get(function(req, res) {
//     return res.send('Return url');
// });

router.route('/createConnectAccount').get(protected, createNewAccount);
router.route('/updateConnectAccount').get(protected, updateAccount);
router.route('/return/:accountId').get(completeAccount);

module.exports = router;