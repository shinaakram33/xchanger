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
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // console.log(con.connection);
    console.log("DB connection successfully!");
  });
//   const timing = '00 00 00 30 * *'
//   var task = cron.schedule( timing , () => {
//     console.log('it will run evey 30 days');
// });
// console.log("Cron-Job Task", task);

// app.listen(port, () => {
//   console.log(`App running on a port ${port}`);
// });

console.log("Running on http://" + port);

io.on("connection", (socket) => {
  console.log("Connected: ");
  socket.on("disconnect", () => {
    console.log("Disconnected: " + socket.userId);
  });
  var connectedClients = {};
  socket.on("joinRoom", ({ chatroomId, id }) => {
    console.log(chatroomId, id);
    socket.join(chatroomId);
    connectedClients[id] = socket.id;
    console.log(`A user joined chatroom: ${chatroomId} with id : ${id}`);
  });

  socket.on("leaveRoom", ({ chatroomId, id }) => {
    socket.leave(chatroomId);
    delete connectedClients[id];
    console.log("A user left chatroom: " + chatroomId);
  });

  socket.on("chatroomMessage", async (data) => {
    console.log("hello #####", data);
    const chatMessage = data[0];
    console.log(chatMessage);
    console.log(chatMessage.user.chatroomId, "RoomId");
    console.log(chatMessage.user.ownerId);

    let ids = [];
    ids[0] = chatMessage.user.chatroomId.slice(0, (chatMessage.user.chatroomId.length)/2);
    ids[1]=chatMessage.user.chatroomId.slice((chatMessage.user.chatroomId.length)/2)
    console.log(ids);
    let user;
    user = chatMessage.user.ownerId === ids[0]? ids[1]: ids[0];
    console.log('')
    let sender = await User.findById(chatMessage.user.ownerId);
    let textNotificaton = {
      user: user,
      text: `${sender.name} sent you a message`,
      chat_room_id: chatMessage.user.chatroomId,
      message: true,
    };
    console.log(textNotificaton);

    fetch("https://clothingsapp.herokuapp.com/api/v1/notification", {
      method: "POST",
      body: JSON.stringify(textNotificaton),
      headers: { "Content-Type": "application/json" },
    })
      // .then((res) => res.json())
      // .then((json) => console.log(json));
      .then(async (res) => {
        try {
          console.log("res ", res);
          const dataa = await res.json();
          console.log("response data?", dataa);
        } catch (err) {
          console.log("error");
          console.log(err);
        }
      })
      // .then((json) => console.log("json ", json))
      .catch((error) => {
        console.log(error);
      });

    if (chatMessage.text.trim().length > 0) {
      console.log(data);
      const user = await User.findOne({ _id: chatMessage.user._id });
      const newMessage = new Chat({
        // _id: chatMessage._id,
        chat_room_id: chatMessage.user.chatroomId,
        user: chatMessage.user,
        text: chatMessage.text,
      });
      const obj = await newMessage.save();
      console.log(obj);
      io.to(obj.chat_room_id).emit("newMessage", {
        obj,
      });
    }
  });
});
