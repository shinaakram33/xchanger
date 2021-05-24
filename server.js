const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const User = require('./models/userModal')
const Chat = require('./models/chatModal')


dotenv.config({ path: './config.env' });
const app = require('./app');
const cron = require('node-cron')
const DB = process.env.DATABASE;
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
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App running on a port ${port}`);
});
