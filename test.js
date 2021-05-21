const schedule = require('node-schedule');
var cron = require('node-cron');

const someDate = new Date(2021, 05, 20, 21, 08, 0);
console.log(someDate);
cron.schedule('0 12 16 20 05 *', () => {
    console.log('running a task every minute');
});

// //const someDate = new Date('2021-05-20T21:02:00.000');
// const someDate = new Date(2021, 05, 20, 21, 05, 0);

// console.log(someDate);

let date = { date:21,hour:16, minute:38 }

schedule.scheduleJob(date,()=>{
    console.log("Done");
})