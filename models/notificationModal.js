const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user:{
      type: mongoose.Schema.ObjectId,
      ref:'User'
  },
  product:{
    type: mongoose.Schema.ObjectId,
    ref:'Product'
  },
  text:{
      type:String,
      required: [true, 'Notification text is reqired'],
  },
  status:{
      type:Boolean,
      default: false
  }
});

const notification = mongoose.model('Notification', notificationSchema);

module.exports = notification;
