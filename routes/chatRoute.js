const express = require('express');
const { getChatOfParticularROom, createChatRoom } = require('../controllers/chatController');
const { protected, restrictTo } = require('../controllers/authController');
const router = express.Router();

router.route('/chat/:chatroom_id').get(getChatOfParticularROom)
router.route('/chat').post(createChatRoom)

module.exports = router;

