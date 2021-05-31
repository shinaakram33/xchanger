const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const User = require('./models/userModal')
const Chat = require('./models/chatModal')
const Notification = require('./models/notificationModal')
const fetch = require('node-fetch');


dotenv.config({ path: './config.env' });
const app = require('./app');
const cron = require('node-cron')
const DB = process.env.DATABASE;
const port = process.env.PORT || 4000;
const server = http.createServer(app);
server.listen(port);
let io = require('socket.io')(server);
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
    console.log('DB connection successfully!');
  });
//   const timing = '00 00 00 30 * *'
//   var task = cron.schedule( timing , () => {
//     console.log('it will run evey 30 days');
// });
// console.log("Cron-Job Task", task);




// app.listen(port, () => {
//   console.log(`App running on a port ${port}`);
// });

console.log("Running on http://"+port);

io.on("connection", (socket) => {
  console.log("Connected: ");
  socket.on("disconnect", () => {
    console.log("Disconnected: " + socket.userId);
  });
  var connectedClients = {};
  socket.on("joinRoom", ({ chatroomId,id }) => {
    socket.join(chatroomId);
    connectedClients[id] = socket.id;
    console.log(`A user joined chatroom: ${chatroomId} with id : ${id}`);
  });

  socket.on("leaveRoom", ({ chatroomId, id }) => {
    socket.leave(chatroomId);
    delete connectedClients[id];
    console.log("A user left chatroom: " + chatroomId);
  });

  socket.on("chatroomMessage", async ( data ) => {
    console.log("hello #####", data);
    const chatMessage = data[0];
    console.log(chatMessage.pId, chatMessage.uId)
    let textNotificaton = {
      user:chatMessage.ownerId,
      text: `You have a new message`,
      chat_room_id: chatMessage.user.chatroomId
    };
    console.log('check2',data);
    console.log('check2',updatedProduct);
    fetch('https://x-changer.herokuapp.com/api/v1/notification', {
      method: 'POST',
      body: JSON.stringify(textNotificaton),
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())
      .then(json => console.log(json));
    
    if (chatMessage.text.trim().length > 0) {
      console.log(data);
      const user = await User.findOne({ _id: chatMessage.user._id });
      const newMessage = new Chat({
        // _id: chatMessage._id,
        chat_room_id: chatMessage.user.chatroomId,
        user: chatMessage.user,
        text:chatMessage.text
      });
      const obj = await newMessage.save();
      console.log(obj);
      io.to(obj.chat_room_id).emit("newMessage", {
        obj
      });
    }
  });

});
