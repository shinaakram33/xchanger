var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const Chat = new Schema({
  _id: {
    type: String,
    required: true
  },
  chat_room_id: {
    type: String,
    required: true,
  },
  user:{
      name:{
        type: String,
        required: true
      },
      _id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      }
  },
  text:{
      type: String,
      required: true
  }
},{ timestamps: true }
);

module.exports = mongoose.model("Chat", Chat);