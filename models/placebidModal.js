const mongoose = require('mongoose');
const placeBidSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: [true, 'price of product is required'],
    },
    // date: {
    //   type: Date,
    //   default: Date(),
    //   required: [true, 'date  is required'],
    // },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'user data is required'],
    },
    // time: {
    //   type: Date,
    //   default: Date.now(),
    // },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'product data is required'],
    },
    intentId: {
      type: String,
    },
    succeeded: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

const placeBid = mongoose.model('placeBid', placeBidSchema);
module.exports = placeBid;
