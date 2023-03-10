const Chat = require('../models/chatModal');

exports.getChatOfParticularROom = async (req, res) => {
    try {
      const messages = await Chat.find({ chat_room_id: req.params.chatroom_id})

      if(!messages){
        res.status(400).json({
            status: 'Messages Not Found For That Particular Room',
            message: err,
        });
      }

      res.status(200).json({
        status: 'success',
        data: messages,
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err,
      });
    }
  };

  exports.createChat = async (req, res) => {
    try {
      const chatRoom = await Chat.create(req.body);
      res.status(200).json({
        status: 'success',
        user: chatRoom,
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err,
      });
    }
  };