const express = require('express');
const { uploadFile } = require('../controllers/uploadFile');
const { protected, restrictTo } = require('../controllers/authController');
const upload = require('../config/multer.config');
const router = express.Router();

router.route('/').post(protected, upload, uploadFile);
module.exports = router;
