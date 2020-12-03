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
// wishListModal.pre(/^find/, function (next) {
//   this.populate({
//     path: 'products',
//   });
//   next();
// });
const WishList = mongoose.model('WishList', wishListModal);

module.exports = WishList;
