const express = require('express');
const { getChatOfParticularROom, createChat } = require('../controllers/chatController');
const { protected, restrictTo } = require('../controllers/authController');
const router = express.Router();

router.route('/chat/:chatroom_id').get(getChatOfParticularROom)
router.route('/chat').post(createChat)

module.exports = router;

