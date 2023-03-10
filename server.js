const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const User = require("./models/userModal");
const Chat = require("./models/chatModal");
const Notification = require("./models/notificationModal");
const fetch = require("node-fetch");

dotenv.config({ path: "./config.env" });
const app = require("./app");
const cron = require("node-cron");
const DB = process.env.DATABASE;
const port = process.env.PORT || 4000;
const server = http.createServer(app);
server.listen(port);
let io = require("socket.io")(server);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
  });


io.on("connection", (socket) => {
  socket.on("disconnect", () => {
  });
  var connectedClients = {};
  socket.on("joinRoom", ({ chatroomId, id }) => {
    socket.join(chatroomId);
    connectedClients[id] = socket.id;
  });

  socket.on("leaveRoom", ({ chatroomId, id }) => {
    socket.leave(chatroomId);
    delete connectedClients[id];
  });

  socket.on("chatroomMessage", async (data) => {
    const chatMessage = data[0];

    let ids = [];
    ids[0] = chatMessage.user.chatroomId.slice(0, (chatMessage.user.chatroomId.length)/2);
    ids[1]=chatMessage.user.chatroomId.slice((chatMessage.user.chatroomId.length)/2)
    let receiver;
    receiver = JSON.stringify(chatMessage.user._id) === JSON.stringify(ids[0])? ids[1]: ids[0];
    let sender = await User.findById(chatMessage.user._id);
    let textNotificaton = {
      user: receiver,
      text: `${sender.name} sent you a message`,
      chat_room_id: chatMessage.user.chatroomId,
      message: true,
      sender: sender.id,
      product_id: chatMessage?.user?.product_id || '',
      newPrice: chatMessage?.user?.newPrice || '',
    };
    fetch("https://x-changer.herokuapp.com/api/v1/notification", {
      method: "POST",
      body: JSON.stringify(textNotificaton),
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        try {
          const dataa = await res.json();
        } catch (err) {
        }
      })
      .catch((error) => {
      });

    if (chatMessage.text.trim().length > 0) {
      const user = await User.findOne({ _id: chatMessage.user._id });
      const newMessage = new Chat({
        chat_room_id: chatMessage.user.chatroomId,
        user: chatMessage.user,
        text: chatMessage.text,
      });
      const obj = await newMessage.save();
      io.to(obj.chat_room_id).emit("newMessage", {
        obj,
      });
    }
  });
});
