const mongoose = require('mongoose');
const placeBidSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: [true, 'price of product is required'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'user data is required'],
    },
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
    status: {
      type: String,
      enum: {
        values: ['In process', 'Succeeded', 'Failed'],
      },
      default: 'In process',
    },
    orderDetails: {
      name: String,
      email: String,
      phoneNumber: String,
      location: String,
      shippingFee: Number,
    }
  },
  { timestamps: true }
);

const placeBid = mongoose.model('placeBid', placeBidSchema);
module.exports = placeBid;
