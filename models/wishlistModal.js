const mongoose = require('mongoose');

const wishListModal = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User Id is required'],
  },
  products: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Product Id is required'],
      validate: {
        validator: function (val) {
          if (this.products.length === 0) {
            return false;
          }
        },
        message: 'Product Id is required',
      },
    },
  ],
});
const WishList = mongoose.model('WishList', wishListModal);

module.exports = WishList;
