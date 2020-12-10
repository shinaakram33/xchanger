const express = require('express');
const { createRecentViews, getRecentViews } = require('../controllers/recentViewController');
const { protected } = require('../controllers/authController');

const router = express.Router();

router.route('/').post(protected, createRecentViews).get(protected, getRecentViews);

module.exports = router;
