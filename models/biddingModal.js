const mongoose = require('mongoose');
const validator = require('validator');

const biddingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'user data is required!'],
    },

    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Product data is required!'],
    },
    bidByUser: [{ type: mongoose.Schema.ObjectId, ref: 'placeBid', default: undefined }],
  },
  { timestamps: true }
);
const Bidding = mongoose.model('Bidding', biddingSchema);
module.exports = Bidding;
