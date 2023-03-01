const express = require('express');
const { applyFilter } = require('../controllers/filterController');
const router = express.Router();

router.route('/').get(applyFilter);

module.exports = router;
