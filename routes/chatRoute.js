const express = require('express');
const { getChatOfParticularROom } = require('../controllers/chatController');
const { protected, restrictTo } = require('../controllers/authController');
const router = express.Router();

router.route('/chat/:chatroom_id').get(getChatOfParticularROom)

module.exports = router;

