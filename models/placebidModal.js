const mongoose = require('mongoose');
const placeBidSchema = new mongoose.Schema({
  price: {
    type: String,
    required: [true, 'price of product is required'],
  },
  date: {
    type: Date,
    default: Date.now,
    required: [true, 'date  is required'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'user data is required'],
  },
  time: {
    type: Date,
    default: Date.getTime,
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bidding',
    required: [true, 'product data is required'],
  },
});

const placeBid = mongoose.model('placeBid', placeBidSchema);
module.exports = placeBid;
